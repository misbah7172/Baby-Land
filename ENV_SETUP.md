# Environment Configuration Setup

This project uses **separate environment files** for backend and frontend services to maintain clear separation of concerns and avoid mixing unrelated variables.

## 📁 Environment Files Structure

```
.
├── .env                      # ❌ Legacy (not used - kept for compatibility)
├── .env.example              # Legacy template
├── .env.backend              # ✅ Backend environment (git-ignored)
├── .env.backend.example      # Backend template (git-tracked)
├── .env.frontend             # ✅ Frontend environment (git-ignored)
└── .env.frontend.example     # Frontend template (git-tracked)
```

---

## 🚀 Quick Start

### 1. Create Backend Environment File

```bash
cp .env.backend.example .env.backend
```

Edit `.env.backend` with your values:
```env
NODE_ENV=development
DATABASE_URL=mysql://baby_land:baby_land_password@localhost:3306/baby_land
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-32-char-secret-here
# ... other backend variables
```

### 2. Create Frontend Environment File

```bash
cp .env.frontend.example .env.frontend
```

Edit `.env.frontend` with your values:
```env
NODE_ENV=development
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
BACKEND_API_URL=http://localhost:4000
# ... other frontend variables
```

### 3. Start Services

```bash
# Using docker-compose (recommended)
docker-compose up --build

# Or local development
npm install
npm run dev
```

---

## 📋 Backend Environment Variables (`.env.backend`)

**Purpose:** Express.js backend server configuration

**Database & Cache:**
- `DATABASE_URL` - MySQL connection string
- `REDIS_URL` - Redis connection string

**Server:**
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)

**Authentication:**
- `JWT_ACCESS_SECRET` - Access token secret (32+ chars in production)
- `JWT_REFRESH_SECRET` - Refresh token secret (32+ chars in production)

**CORS & Origins:**
- `FRONTEND_URL` - Frontend origin
- `BACKEND_URL` - Public backend URL
- `CORS_ORIGIN` - Allowed CORS origin

**Admin:**
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password

**Full list:** See `.env.backend.example`

---

## 📋 Frontend Environment Variables (`.env.frontend`)

**Purpose:** Next.js frontend application configuration

**API Connection:**
- `NEXT_PUBLIC_BACKEND_URL` - Backend URL for browser requests
- `BACKEND_API_URL` - Backend URL for server-side requests

**Firebase (Client-side safe):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- (Other Firebase config keys)

**Admin Panel:**
- `NEXT_PUBLIC_ADMIN_PATH` - Admin dashboard secret path
- `NEXT_PUBLIC_ADMIN_EMAIL` - Admin email
- `NEXT_PUBLIC_ADMIN_PASSWORD_HASH` - Admin password hash

**Full list:** See `.env.frontend.example`

---

## 🐳 Docker Compose Configuration

The `docker-compose.yml` has been updated to use separate env files:

**Backend service:**
```yaml
backend:
  env_file:
    - .env.backend
  environment:
    # Overrides for docker-compose network
    DATABASE_URL: mysql://baby_land:baby_land_password@mysql:3306/baby_land
    REDIS_URL: redis://redis:6379
    NODE_ENV: production
```

**Frontend service:**
```yaml
frontend:
  env_file:
    - .env.frontend
```

---

## 🚄 Railway Deployment

For Railway deployment, environment variables should be set in the **Railway Dashboard** for each service:

### Backend Service Variables
Set these in Railway → Backend Service → Variables:
```
NODE_ENV=production
DATABASE_URL=<Railway MySQL URL>
REDIS_URL=<Railway Redis URL>
FRONTEND_URL=https://your-frontend.railway.app
BACKEND_URL=https://your-backend.railway.app
CORS_ORIGIN=https://your-frontend.railway.app
JWT_ACCESS_SECRET=<strong-32+-char-secret>
JWT_REFRESH_SECRET=<strong-32+-char-secret>
COOKIE_DOMAIN=your-frontend.railway.app
COOKIE_SECURE=true
```

### Frontend Service Variables
Set these in Railway → Frontend Service → Variables:
```
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
BACKEND_API_URL=https://your-backend.railway.app
COOKIE_DOMAIN=your-frontend.railway.app
COOKIE_SECURE=true
# Firebase and admin variables (same as local)
```

**Note:** Railway auto-injects `DATABASE_URL` and `REDIS_URL` when you attach MySQL and Redis services.

---

## 🔒 Security Best Practices

### ✅ Do This:
- ✅ Use `.env.backend.example` and `.env.frontend.example` in git
- ✅ Generate strong JWT secrets (32+ chars, mixed case, numbers, special chars)
- ✅ Use different secrets for development and production
- ✅ Set `COOKIE_SECURE=true` in production
- ✅ Only expose public keys (prefixed with `NEXT_PUBLIC_`)

### ❌ Don't Do This:
- ❌ Commit `.env.backend` or `.env.frontend` to git
- ❌ Use same secrets for dev and production
- ❌ Expose private keys in browser (without `NEXT_PUBLIC_` prefix)
- ❌ Store passwords in plaintext (hash or use secure alternatives)

---

## 🔄 Migration from Old `.env` Setup

If you were using a single `.env` file:

1. **Create separate files:**
   ```bash
   cp .env.backend.example .env.backend
   cp .env.frontend.example .env.frontend
   ```

2. **Copy relevant values** from old `.env` to appropriate files:
   - Database & cache vars → `.env.backend`
   - Firebase & client vars → `.env.frontend`

3. **Verify docker-compose works:**
   ```bash
   docker-compose up --build
   ```

4. **Commit the `.example` files** (templates):
   ```bash
   git add .env.backend.example .env.frontend.example
   git add docker-compose.yml
   git add .gitignore
   git commit -m "Separate environment files for backend and frontend"
   ```

5. **The actual env files** are ignored by git automatically

---

## 🧪 Testing Your Setup

### Test Backend Connection:
```bash
curl http://localhost:4000/health
# Should return: {"ok":true,"service":"baby-land-api",...}
```

### Test Frontend:
```bash
# Open browser
http://localhost:3000
# Should load homepage
```

### Test Database:
```bash
# Backend should connect to MySQL
curl http://localhost:4000/api/products
# Should return products list
```

---

## ❓ Troubleshooting

### "Variable not found" errors
- Check the correct `.env.backend` or `.env.frontend` file has the variable
- Backend variables in `.env.frontend` won't work and vice versa

### Frontend can't reach backend
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.frontend`
- Check `CORS_ORIGIN` in `.env.backend` matches frontend URL

### Database connection fails
- Verify `DATABASE_URL` format in `.env.backend`
- For docker-compose, use `mysql://user:pass@mysql:3306/db`
- For Railway, copy the URL from Railway dashboard

### Docker compose builds fail
- Make sure `.env.backend` and `.env.frontend` exist
- Check for syntax errors (special characters need escaping)
- Try rebuilding: `docker-compose up --build --no-cache`

---

## 📚 Related Documentation

- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Complete Railway setup guide
- [SECURITY_BEST_PRACTICES.md](./SECURITY_BEST_PRACTICES.md) - Security guidelines
- [README.md](./README.md) - Project overview

---

**Last Updated:** April 20, 2026  
**Version:** 1.0 - Separated Environment Files
