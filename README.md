# Baby Land - E-Commerce Platform

Production-ready e-commerce platform for baby clothes, accessories, and essentials.

## 🏢 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | Storefront + Admin UI |
| **Backend** | Express.js, Node.js 24 | REST API |
| **Database** | MySQL 8.4 | Relational data storage |
| **Cache** | Redis 7 | Performance optimization |
| **Auth** | JWT tokens | Secure authentication |
| **Deployment** | Railway | Managed cloud platform |
| **Containers** | Docker | Containerization |

## 📁 Project Structure

```
baby-land/
├── frontend/              # Next.js 15 application
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── Dockerfile        # Frontend container
├── backend/              # Express.js API
│   ├── src/              # TypeScript source
│   ├── routes/           # API endpoints
│   ├── lib/              # Core utilities
│   └── Dockerfile        # Backend container
├── database/             # Prisma & migrations
│   └── prisma/           # Schema and seed
├── docker/               # Docker utilities
│   └── entrypoint.backend.sh
├── docker-compose.yml    # Local development stack
├── railway.json          # Railway deployment config
└── .env.railway.example  # Environment template
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm

### Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd baby-land

# 2. Copy environment template
cp .env.example .env

# 3. Update secrets in .env if needed
# Edit .env and change default admin credentials

# 4. Start all services
docker-compose up --build

# 5. Access applications
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# API Docs: http://localhost:4000/health
```

### Verify Setup

```bash
# Test frontend
curl http://localhost:3000

# Test backend health
curl http://localhost:4000/health

# Expected response:
# {"ok":true,"service":"baby-land-api","timestamp":"...","environment":"production"}

# View database (requires Prisma Studio)
npm run prisma:studio -w frontend
```

## 🌐 Railway Deployment

### Quick Deploy (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Connect GitHub account

2. **Create Project**
   - New Project → Deploy from GitHub
   - Select baby-land repository

3. **Add Services**
   - Add → MySQL 8.4 (Database)
   - Add → Redis (Cache)
   - Add → Deploy from GitHub (Backend)
   - Add → Deploy from GitHub (Frontend)

4. **Configure Environment**
   - See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed steps
   - Fill in environment variables from `.env.railway.example`

5. **Deploy**
   - Push to main branch → Auto-deploys
   - Or manually trigger in Railway dashboard

### Environment Variables

```bash
# Copy template
cp .env.railway.example .env.railway

# Required variables:
NODE_ENV=production
FRONTEND_URL=https://baby-land-frontend-xxxx.railway.app
BACKEND_URL=https://baby-land-backend-xxxx.railway.app
DATABASE_URL=mysql://...  # Auto-injected by Railway
REDIS_URL=redis://...      # Auto-injected by Railway
JWT_ACCESS_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
COOKIE_SECURE=true
```

**⚠️ Important:** Generate secure secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 Documentation

### Deployment
- [**RAILWAY_DEPLOYMENT.md**](./RAILWAY_DEPLOYMENT.md) - Complete deployment guide
- Step-by-step instructions
- Troubleshooting guide
- Monitoring and logs

### Security
- [**SECURITY_BEST_PRACTICES.md**](./SECURITY_BEST_PRACTICES.md) - Security guidelines
- Secret management
- Incident response
- Pre-production checklist

### Architecture
- [**CODE_REVIEW_ARCHITECTURE.md**](./CODE_REVIEW_ARCHITECTURE.md) - Technical deep dive
- Architecture decisions
- Code changes analysis
- Performance optimization

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Railway Infrastructure          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │   Frontend (Next.js)             │   │
│  │   - Standalone mode              │   │
│  │   - Client/Server components     │   │
│  │   - Static asset CDN             │   │
│  └──────────────────────────────────┘   │
│                 ↓                       │
│  ┌──────────────────────────────────┐   │
│  │   Backend (Express API)          │   │
│  │   - Rate limiting                │   │
│  │   - CORS protected               │   │
│  │   - JWT auth tokens              │   │
│  │   - Error handling               │   │
│  └──────────────────────────────────┘   │
│      ↓              ↓                    │
│  ┌─────────┐   ┌────────┐              │
│  │  MySQL  │   │  Redis │              │
│  │  8.4    │   │   7    │              │
│  └─────────┘   └────────┘              │
│                                         │
└─────────────────────────────────────────┘
```

## 🔒 Security Features

- ✅ **HTTPS Enforcement** - Railway managed SSL/TLS
- ✅ **JWT Authentication** - Access + Refresh tokens
- ✅ **Rate Limiting** - 200 req/15min global, 5 req/15min for auth
- ✅ **CORS Protection** - Single origin restriction
- ✅ **Input Validation** - Zod schemas on all endpoints
- ✅ **Password Hashing** - bcryptjs with 10 rounds
- ✅ **Secure Cookies** - HttpOnly, Secure, SameSite flags
- ✅ **Security Headers** - Helmet.js middleware
- ✅ **HSTS** - 1 year enforcement

See [SECURITY_BEST_PRACTICES.md](./SECURITY_BEST_PRACTICES.md) for details.

## 📊 Database Schema

### Core Models
- **Users** - Customer and admin accounts
- **Products** - Clothing items with inventory
- **Categories** - Product categorization
- **Orders** - Customer purchases
- **Cart** - Shopping cart (guest + user)
- **Reviews** - Product reviews and ratings

### Key Features
- Soft deletes ready (add `deletedAt` field)
- Audit logging ready (add `createdBy`, `updatedBy`)
- Full-text search ready (add indexes)
- Relationships with cascading rules

## 🔄 Development Workflow

### Local Development

```bash
# Start stack
docker-compose up -d

# Rebuild after schema changes
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Database commands
npm run prisma:migrate -w backend      # Create migration
npm run prisma:generate -w backend     # Generate client
npm run prisma:seed -w backend         # Run seed
npm run prisma:studio -w frontend      # Prisma UI

# Stop services
docker-compose down

# Clean up everything
docker-compose down -v  # -v removes volumes
```

### Making Changes

1. **Backend Changes**
   ```bash
   # API updates
   vim backend/src/routes/products.routes.ts
   
   # Rebuild
   docker-compose up --build backend
   ```

2. **Frontend Changes**
   ```bash
   # React components
   vim frontend/components/ProductCard.tsx
   
   # Auto-rebuild with next dev
   ```

3. **Database Schema Changes**
   ```bash
   # Update schema
   vim database/prisma/schema.prisma
   
   # Create migration
   npx prisma migrate dev --name add_new_field
   
   # Generate client
   npm run prisma:generate -w backend
   
   # Restart services
   docker-compose up --build
   ```

## 📈 Performance Optimization

### Enabled
- ✅ Next.js standalone mode (smaller bundle)
- ✅ Redis caching layer (optional, degrades gracefully)
- ✅ Connection pooling (MySQL + Redis)
- ✅ Helmet security headers
- ✅ Request compression
- ✅ Static asset optimization

### To Enable
- [ ] Database query caching
- [ ] CDN for static assets (CloudFlare)
- [ ] Image optimization (AWS Lambda)
- [ ] GraphQL layer (optional)

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests  
npm run test:integration

# E2E tests (frontend)
npm run test:e2e -w frontend

# Load testing
npm run test:load
```

## 🚨 Troubleshooting

### Common Issues

**"Database connection failed"**
```bash
# Check MySQL is running
docker-compose ps

# Check DATABASE_URL
docker-compose exec backend env | grep DATABASE

# Verify MySQL is healthy
docker-compose exec mysql mysqladmin ping
```

**"CORS error"**
```bash
# Verify CORS_ORIGIN matches frontend URL exactly
docker-compose exec backend env | grep CORS_ORIGIN

# Check Backend URL in frontend env
docker-compose exec frontend env | grep BACKEND_API_URL
```

**"Redis connection refused"**
```bash
# Leave REDIS_URL empty to disable caching
# Or check Redis is running
docker-compose ps redis
```

**"Out of memory"**
```bash
# Check memory usage
docker stats

# Reduce Node.js memory limit
NODE_OPTIONS=--max_old_space_size=512
```

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md#-troubleshooting) for Railway-specific issues.

## 📦 Dependencies

### Frontend
- next@15.3.2
- react@19.1.0
- typescript@5.8.2
- tailwindcss@3.4.17

### Backend
- express@5.1.0
- prisma@6.6.0
- zod@3.24.2
- ioredis@5.4.1

### DevOps
- docker
- docker-compose

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "Add feature X"`
4. Push to GitHub: `git push origin feature/my-feature`
5. Create Pull Request with description

## 📋 Pre-Production Checklist

- [ ] All environment variables configured
- [ ] Secrets rotated and stored securely
- [ ] Database backups enabled
- [ ] HTTPS enforced
- [ ] Rate limiting tested under load
- [ ] Admin account password changed
- [ ] Error logging configured
- [ ] Health checks passing
- [ ] Frontend URLs updated
- [ ] CORS origins verified

## 📞 Support

### Documentation
- [Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- [Security Guide](./SECURITY_BEST_PRACTICES.md)
- [Architecture Guide](./CODE_REVIEW_ARCHITECTURE.md)

### External Links
- Railway Docs: https://docs.railway.app
- Next.js Docs: https://nextjs.org/docs
- Express Docs: https://expressjs.com
- Prisma Docs: https://www.prisma.io/docs

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** April 2024
**Version:** 2.0.0 (Railway Edition)
**Maintainer:** Development Team


```bash
npm run prisma:generate:postgres -w backend
npm run prisma:migrate:postgres -w backend
npm run prisma:seed -w backend
```

## Deploy On Render

- Use `render.yaml` as the blueprint.
- The frontend and backend are both containerized with Docker.
- Redis is provisioned as a managed Render service for backend cart/session caching.
- Set backend `DATABASE_URL` to Supabase PostgreSQL in Render environment variables.
- Keep `PRISMA_PROVIDER=postgres` for Render backend.

## Database

The Docker backend image generates Prisma Client during the build.
Local Docker backend uses `PRISMA_PROVIDER=mysql` and runs Prisma db push for resilient startup.
Render backend uses `PRISMA_PROVIDER=postgres` and runs Prisma migrate deploy.

To run them manually:

```bash
npm install
npm run prisma:generate -w backend
npm run prisma:migrate -w backend
npm run prisma:seed -w backend
```

## Default Admin

Use the credentials from `.env.example` or your local `.env` to sign in as admin.

## Notes

- Guest carts are stored in Redis.
- Logged-in carts are stored in MySQL through Prisma.
- Product listing and detail responses are cached in Redis.