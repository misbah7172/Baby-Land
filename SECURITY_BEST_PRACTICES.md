# Security & Deployment Best Practices - Baby Land

Complete security guide for production deployment on Railway.

## 🔐 Security Overview

### Architecture
```
┌─────────────────────────────────────────┐
│         Railway (Managed)               │
│  ┌────────────────────────────────────┐ │
│  │ Frontend (HTTPS only)              │ │
│  │ - Static Next.js build            │ │
│  │ - Client-side encryption ready    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Backend (HTTPS only)               │ │
│  │ - Rate limited                    │ │
│  │ - Helmet security headers         │ │
│  │ - CORS protected                  │ │
│  │ - JWT auth token rotation         │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ MySQL (Encrypted at rest)         │ │
│  │ - Connection pooling              │ │
│  │ - Regular backups                 │ │
│  │ - Access controlled               │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Redis (In-memory cache)           │ │
│  │ - Optional (degrades gracefully)  │ │
│  │ - No persistent data stored       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🛡️ Security Controls

### 1. Authentication & Authorization

#### JWT Token Management
- **Access Token**: Short-lived (typically 15 minutes)
  - Used for API requests
  - Stored in secure HttpOnly cookies
  - Cannot be accessed by JavaScript
  - Automatically sent with requests

- **Refresh Token**: Long-lived (typically 7 days)
  - Used to obtain new access tokens
  - Rotation: Always issue new refresh token with new access token
  - Stored securely in database with hash

**Implementation:**
```typescript
// Token generation with expiration
const accessToken = jwt.sign(
  { userId, role },
  JWT_ACCESS_SECRET,
  { expiresIn: '15m' }  // Short-lived
);

const refreshToken = jwt.sign(
  { userId },
  JWT_REFRESH_SECRET,
  { expiresIn: '7d' }  // Longer-lived
);

// Stored in secure HttpOnly cookie (no JS access)
res.cookie('accessToken', accessToken, {
  httpOnly: true,      // ← Prevents XSS attacks
  secure: true,        // ← HTTPS only (Railway enforces)
  sameSite: 'strict',  // ← Prevents CSRF
  maxAge: 15 * 60 * 1000  // 15 minutes
});
```

#### Admin Account Security
- **Never** use default credentials in production
- **Change** immediately after first login
- **Use** strong passwords (12+ chars, mixed case, numbers, special chars)
- **Rotate** periodically (monthly recommended)
- **Monitor** admin account activity in logs

---

### 2. Encryption in Transit

#### HTTPS Enforcement
- Railway automatically provides SSL/TLS certificates
- All data encrypted in transit
- HSTS headers enable browser enforcement (1 year)

```typescript
// Helmet configuration
helmet({
  hsts: {
    maxAge: 31536000,    // 1 year
    includeSubDomains: true,
    preload: true        // Include in browser preload lists
  }
});
```

#### Database Connection
- MySQL connection uses TLS if available
- Connection pooling prevents connection exhaustion
- SSL mode: `?sslmode=require` in production

---

### 3. Encryption at Rest

#### Database
- Railway MySQL includes:
  - Encryption at rest (depends on plan)
  - Automated backups with encryption
  - Point-in-time recovery

#### Sensitive Data
- Passwords: Hashed with bcryptjs (rounds: 10)
  ```typescript
  const hashedPassword = await bcryptjs.hash(password, 10);
  ```
- API Keys: Stored as hashed values, not plaintext
- Credit Cards: Never stored (use payment gateway like Stripe)

---

### 4. Rate Limiting & DDoS Protection

#### Global Rate Limiting
```
- 200 requests per 15 minutes (global)
- Tracked by IP address (X-Forwarded-For for proxies)
- Health check endpoint exempt
```

#### Auth Endpoint Protection
```
- 5 attempts per 15 minutes for:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/refresh
```

#### Implementation
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress,
  skip: (req) => req.path === '/health'
});

// Stricter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
```

---

### 5. CORS (Cross-Origin Resource Sharing)

#### Strict Configuration
```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN,  // Single domain only
  credentials: true,                 // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // Browser cache 24 hours
};
```

#### Preflight Caching
- OPTIONS requests cached for 24 hours
- Reduces unnecessary preflight overhead
- Still respects origin restrictions

---

### 6. Request Validation & Input Sanitization

#### Zod Schema Validation
All incoming data validated against strict schemas:

```typescript
// Example: User registration
const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)         // Uppercase
    .regex(/[0-9]/)         // Number
    .regex(/[^A-Za-z0-9]/), // Special char
  name: z.string().min(2).max(100).trim()
});

// Validation before use
const data = registerSchema.parse(req.body);
```

#### SQL Injection Prevention
- Prisma uses parameterized queries
- Never concatenate user input into queries
- Type-safe query builder

---

### 7. Error Handling & Information Disclosure

#### Production Error Responses
```typescript
// Development (detailed)
if (NODE_ENV === 'development') {
  res.json({
    error: error.message,
    stack: error.stack,  // Full stack trace
    details: error.details
  });
}

// Production (generic)
if (NODE_ENV === 'production') {
  res.status(500).json({
    error: 'Internal server error',
    // No sensitive details!
  });
}

// Log full error server-side for debugging
console.error('[REQUEST_ID]', error);
```

#### Sensitive Data Masking
```typescript
// Never log:
- Database URLs with passwords
- JWT tokens
- Payment information
- User passwords
- API keys

// Safe logging:
- Sanitized URLs (password removed)
- User IDs (not names/emails)
- Operation type
- Timestamp
- Request ID (for tracing)
```

---

### 8. Content Security & Headers

#### Helmet Middleware Configuration
```typescript
helmet({
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Enable XSS filter
  xssFilter: true,
  
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Firebase requires this
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
});
```

---

### 9. Session Management

#### Cookie Security
```typescript
// Secure configuration
res.cookie('accessToken', token, {
  httpOnly: true,      // ← Prevents XSS theft
  secure: true,        // ← HTTPS only
  sameSite: 'strict',  // ← Prevents CSRF
  domain: COOKIE_DOMAIN,
  path: '/',
  maxAge: 15 * 60 * 1000  // 15 minutes
});
```

#### Session Fixation Prevention
- New cookies issued after login
- Old cookies invalidated
- Session ID in database linked to user

---

### 10. Dependency Management

#### Keep Dependencies Updated
```bash
# Check for vulnerabilities
npm audit

# Fix known vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

#### Regular Security Audits
- Weekly: `npm audit`
- Monthly: Update dependencies
- Quarterly: Major version upgrades
- Immediately: Critical vulnerability patches

---

## 🚨 Incident Response Plan

### If Security Breach Detected

1. **Immediate (0-1 hour)**
   - Shut down affected service(s)
   - Preserve logs and evidence
   - Notify security team

2. **Short-term (1-4 hours)**
   - Rotate all secrets (JWT, API keys, DB passwords)
   - Change admin password
   - Review access logs
   - Identify scope of breach

3. **Medium-term (4-24 hours)**
   - Update deployment with patched code
   - Force logout all active sessions
   - Reset user sessions if needed
   - Send notifications to affected users

4. **Long-term (1+ weeks)**
   - Full security audit
   - Implement additional safeguards
   - Update security policies
   - Post-mortem analysis

---

## 📋 Pre-Production Checklist

Before deploying to production:

### Security
- [ ] JWT secrets changed (32+ chars, complex)
- [ ] Admin password changed from default
- [ ] Admin email changed from default
- [ ] COOKIE_SECURE set to `true`
- [ ] COOKIE_DOMAIN set to actual domain
- [ ] CORS_ORIGIN set to frontend domain only
- [ ] Rate limiting appropriate for traffic
- [ ] Database backups configured
- [ ] HTTPS enforced (Railway default)
- [ ] Helmet middleware enabled
- [ ] Input validation on all endpoints

### Performance
- [ ] Redis configured and tested
- [ ] Database indexes verified
- [ ] Connection pooling configured
- [ ] Rate limits tested under load
- [ ] Frontend static assets optimized
- [ ] Backend memory limits configured

### Monitoring
- [ ] Logging configured and tested
- [ ] Error tracking setup (optional: Sentry)
- [ ] Alerts configured for critical metrics
- [ ] Health check endpoint verified
- [ ] Database backup alerts configured

### Documentation
- [ ] Deployment guide completed
- [ ] Environment variables documented
- [ ] Admin account credentials stored securely
- [ ] Disaster recovery plan documented
- [ ] Team trained on security practices

---

## 🔑 Secret Management

### Generation (Do This Once)

```bash
# JWT Secrets (run 3 times for different secrets)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

### Storage (Do This Securely)

1. **Never commit secrets to Git**
   - .env.railway.example is template only
   - .env.railway is ignored by .gitignore

2. **Store in Railway Dashboard**
   - Service → Variables → Add Variable
   - Value displayed only once, cannot be retrieved
   - Mark as "Sync" for shared across services

3. **Backup Access**
   - Store in secure vault: 1Password, LastPass, Vault
   - Include rotation date
   - Share only with authorized personnel

### Rotation (Do This Monthly)

```bash
# Generate new JWT secrets
node -e "console.log('New JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('New JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Update in Railway dashboard
# Trigger redeploy
# Existing tokens will fail, users must re-login (expected)
```

---

## 🛠 Operations Best Practices

### Regular Maintenance
- Update dependencies monthly
- Review logs weekly
- Rotate secrets every 3 months
- Test backups quarterly
- Security audit annually

### Monitoring Critical Metrics
- Response times (target < 200ms)
- Error rates (target < 0.1%)
- CPU usage (target < 70%)
- Memory usage (target < 80%)
- Database connections (monitor growth)

### Backup Strategy
- Automated daily backups (Railway)
- Retention: 30 days minimum
- Tested monthly (restore to staging)
- Stored in multiple regions (Railway)

---

## 📞 Support & Escalation

### Critical Issues
- Application unreachable: Page Yellow/Red
- Data corruption detected: Immediate shutdown
- Security breach confirmed: Incident response plan

### Contact Information
- Railway Support: https://support.railway.app
- Security Issues: report to admin team
- Performance Issues: Check logs first, then escalate

---

**Last Updated:** April 2024
**Version:** 1.0.0
**Review Schedule:** Quarterly

