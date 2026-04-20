# Railway Deployment Guide - Baby Land

Complete guide for deploying Baby Land e-commerce platform to Railway with MySQL and Redis.

## 🚀 Quick Start

### Prerequisites
- Railway account (create at https://railway.app)
- GitHub repository connected to Railway
- Docker installed locally (for testing)

### Services Overview

```
┌──────────────┐
│   Frontend   │ (Next.js 15, Port 3000)
├──────────────┤
│   Backend    │ (Express, Port 4000)
├──────────────┤
│   MySQL 8.4  │ (Database)
├──────────────┤
│   Redis 7    │ (Cache - Optional)
└──────────────┘
```

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Prepare Environment Variables

Generate secure secrets locally:

```bash
# Generate JWT secrets (32+ chars with complexity)
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex').substring(0, 32).toUpperCase())"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex').substring(0, 32).toUpperCase())"

# Or use openssl
openssl rand -base64 32
```

Copy `.env.railway.example` to `.env.railway` and fill in:

```bash
# Core URLs (fill after services are created)
FRONTEND_URL=https://baby-land-frontend-xxxxx.railway.app
BACKEND_URL=https://baby-land-backend-xxxxx.railway.app
CORS_ORIGIN=https://baby-land-frontend-xxxxx.railway.app

# Security - MUST be changed before production
JWT_ACCESS_SECRET=<your-generated-secret-32-chars>
JWT_REFRESH_SECRET=<your-generated-secret-32-chars>
ADMIN_EMAIL=your-email@company.com
ADMIN_PASSWORD=<strong-password-with-uppercase-numbers-special>

# Cookies
COOKIE_DOMAIN=<your-custom-domain-or-empty>
COOKIE_SECURE=true
```

### Step 2: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Connect your Baby Land repository
5. Choose deployment method

### Step 3: Create MySQL Service

1. In Railway dashboard, click "Add Service"
2. Search for "MySQL" → Select MySQL 8.4
3. Configure:
   - Port: 3306 (default)
   - Username: `railway`
   - Database: `baby_land`
4. Click "Deploy"
5. Wait for "Running" status
6. **Copy the DATABASE_URL** from environment variables

### Step 4: Create Redis Service (Optional but Recommended)

1. Click "Add Service"
2. Search for "Redis" → Select Redis
3. Use default settings
4. Click "Deploy"
5. **Copy the REDIS_URL** from environment variables

### Step 5: Deploy Backend Service

1. Click "Add Service" → "Deploy from GitHub"
2. Select your Baby Land repo
3. Configure:
   - Root Directory: `.` (root)
   - Dockerfile: `backend/Dockerfile`
   - Port: 4000
4. Add environment variables from `.env.railway.example`:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<paste-from-MySQL-service>
   REDIS_URL=<paste-from-Redis-service>
   FRONTEND_URL=<will-update-later>
   BACKEND_URL=<this-service-url>
   CORS_ORIGIN=<frontend-url>
   JWT_ACCESS_SECRET=<your-secret>
   JWT_REFRESH_SECRET=<your-secret>
   ADMIN_EMAIL=<your-email>
   ADMIN_PASSWORD=<strong-password>
   COOKIE_DOMAIN=<your-domain>
   COOKIE_SECURE=true
   LOG_LEVEL=info
   ```
5. Click "Deploy"
6. **Wait for deployment to complete**
7. **Copy the Backend Service URL** (e.g., `https://baby-land-backend-xxxxx.railway.app`)

### Step 6: Deploy Frontend Service

1. Click "Add Service" → "Deploy from GitHub"
2. Select your Baby Land repo
3. Configure:
   - Root Directory: `.` (root)
   - Dockerfile: `frontend/Dockerfile`
   - Port: 3000
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_BACKEND_URL=<backend-service-url>/api
   BACKEND_API_URL=<backend-service-url>
   COOKIE_DOMAIN=<your-domain>
   COOKIE_SECURE=true
   NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-key>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-domain>
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project>
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-bucket>
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
   NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
   ```
5. Click "Deploy"
6. **Copy the Frontend Service URL**

### Step 7: Update Backend CORS and URLs

1. Go to Backend service → Variables
2. Update these values:
   ```
   FRONTEND_URL=<frontend-service-url>
   CORS_ORIGIN=<frontend-service-url>
   BACKEND_URL=<backend-service-url>
   ```
3. Trigger redeploy by updating any variable

### Step 8: Verify Deployment

Test the health endpoints:

```bash
# Backend health check
curl https://baby-land-backend-xxxxx.railway.app/health

# Expected response:
# {"ok":true,"service":"baby-land-api","timestamp":"2024-04-20T...","environment":"production"}

# Frontend
# Visit https://baby-land-frontend-xxxxx.railway.app
```

---

## 🔒 Security Checklist

- [ ] JWT secrets changed from defaults (32+ chars with complexity)
- [ ] Admin email changed from `admin@babyland.local`
- [ ] Admin password changed from `Admin12345!` to strong password
- [ ] COOKIE_SECURE set to `true`
- [ ] COOKIE_DOMAIN set to your actual domain
- [ ] All URLs use HTTPS (Railway enforces this)
- [ ] Rate limiting configured appropriately
- [ ] Database backups enabled in Railway dashboard
- [ ] Environment variables marked as "Sync" where needed
- [ ] Secrets never committed to Git (only `.env.railway.example`)

### Setting Up Custom Domain (Optional)

1. Go to Frontend service → Settings
2. Click "Domain" → "Add Domain"
3. Enter your custom domain (e.g., `babyland.com`)
4. Follow DNS configuration instructions
5. Update `COOKIE_DOMAIN` and `CORS_ORIGIN` in Backend service

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Using Railway CLI
railway login
railway logs -s backend
railway logs -s frontend
railway logs -s database
```

### Important Log Patterns

**✓ Healthy Backend Start:**
```
✓ Production environment validated
✓ Database connection successful
✓ Redis connected
✓ API listening on port 4000
✓ Environment: production
```

**❌ Common Issues:**
```
DATABASE_URL must be a MySQL connection string
❌ Failed to start server: Can't connect to MySQL
❌ Redis error: Connection refused
```

---

## 🔄 Database Migrations & Seeding

Migrations run automatically on backend startup via the entrypoint script:

```bash
# Manual migration (if needed)
railway run -s backend npm run prisma:migrate -w backend

# Manual seed
railway run -s backend npm run prisma:seed -w backend

# Prisma Studio (view database)
railway run -s backend npx prisma studio --schema ../database/prisma/schema.prisma
```

---

## 🛠 Troubleshooting

### Issue: "DatabaseError: Failed to connect to MySQL"

**Solution:**
- Check `DATABASE_URL` in Backend environment variables
- Ensure MySQL service is "Running"
- Verify MySQL service is linked to Backend
- Check MySQL credentials in service

### Issue: "CORS error from frontend"

**Solution:**
- Verify `CORS_ORIGIN` in Backend matches Frontend URL exactly
- Check `FRONTEND_URL` in Backend variables
- Ensure Frontend can reach Backend URL
- Check browser console for exact error

### Issue: "Redis connection refused"

**Solution:**
- Leave `REDIS_URL` empty if you don't need caching (it falls back to memory)
- OR ensure Redis service is running and linked
- Check Redis credentials in environment variables

### Issue: "Build fails - dependencies not found"

**Solution:**
- Ensure `npm install` runs in build phase
- Check that `package-lock.json` is committed
- Check Dockerfile COPY statements for correct paths

### Issue: "Out of memory" errors

**Solution:**
- Increase Railway plan for affected service
- Optimize Node.js memory in environment: `NODE_OPTIONS=--max_old_space_size=512`
- Check for memory leaks in application logs

---

## 📈 Performance Optimization

### Tips for Better Performance

1. **Redis Caching**
   - Ensure REDIS_URL is configured
   - Monitor Redis memory usage
   - Set reasonable TTLs for cache keys

2. **Database**
   - Monitor slow queries in logs
   - Use indexes effectively (configured in schema)
   - Connection pooling is automatic

3. **Frontend**
   - Static assets cached by CDN
   - Next.js Image Optimization enabled
   - Build output is minimal with standalone mode

4. **Rate Limiting**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` based on traffic
   - Auth endpoints have stricter limits (5 req/15min)

---

## 🔄 Deployment Updates

### Deploying New Versions

```bash
# Push to main branch (auto-deploy if configured)
git push origin main

# Or manually trigger deploy
# In Railway dashboard, go to Service → Deployments → "Redeploy"
```

### Rollback

1. Go to Service → Deployments
2. Find the previous deployment
3. Click "Redeploy" on previous version

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [MySQL Service Setup](https://docs.railway.app/guides/mysql)
- [Redis Service Setup](https://docs.railway.app/guides/redis)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Custom Domains](https://docs.railway.app/guides/custom-domains)

---

## ⚠️ Important Notes

1. **Always use HTTPS URLs** in production environment variables
2. **Rotate secrets periodically** using Railway's secret management
3. **Enable backups** for MySQL in Railway dashboard
4. **Monitor costs** in Railway dashboard (especially database operations)
5. **Set up monitoring alerts** for critical services
6. **Keep dependencies updated** regularly for security patches

---

## 🆘 Getting Help

If you encounter issues:

1. Check the Troubleshooting section above
2. Review application logs in Railway dashboard
3. Check Railway status page: https://status.railway.app
4. Join Railway Discord community for support
5. Post detailed error logs when asking for help

---

**Last Updated:** April 2024
**Version:** 1.0.0
**Railway Plan:** Starter (with auto-scaling)

