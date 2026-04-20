# Baby Land

Production-ready e-commerce starter for baby clothes, blankets, and accessories.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MySQL (local Docker), Supabase PostgreSQL (production)
- Cache: Redis
- Authentication: JWT access and refresh tokens in HTTP-only cookies
- Containers: Docker and Docker Compose

## Project Layout

- `frontend` - Next.js storefront and admin UI
- `backend` - Express REST API
- `database` - Prisma schema, seed data, and migrations
- `frontend/Dockerfile` - Next.js frontend container image
- `backend/Dockerfile` - Express backend container image

## Run With Docker

1. Copy `.env.example` to `.env` and update secrets if needed.
2. Start the stack:

```bash
docker-compose up --build
```

3. Open the apps:
- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/health`

Docker expects the backend `DATABASE_URL_DOCKER` to point at MySQL and `REDIS_URL` to point at Redis.

## Deploy Frontend To Vercel

Set the Vercel project Root Directory to `frontend`.

Add these environment variables in Vercel:

- `NEXT_PUBLIC_BACKEND_URL` (your deployed backend API URL)
- `BACKEND_API_URL` (backend URL used by server-side route handlers)
- `REDIS_URL` (shared cache connection string)

The backend owns the MySQL `DATABASE_URL`; the frontend only needs the backend and Redis URLs.

If you deploy the backend separately with Supabase PostgreSQL, use the Postgres Prisma scripts:

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