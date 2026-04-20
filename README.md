# Baby Land

Production-ready e-commerce starter for baby clothes, blankets, and accessories.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MySQL (local Docker) and PostgreSQL/Supabase (Vercel)
- Cache: Redis
- Authentication: JWT access and refresh tokens in HTTP-only cookies
- Containers: Docker and Docker Compose

## Project Layout

- `frontend` - Next.js storefront and admin UI
- `backend` - Express REST API
- `database` - Prisma schema, seed data, and migrations
- `docker` - Dockerfiles for the services

## Run With Docker

1. Copy `.env.example` to `.env` and update secrets if needed.
2. Start the stack:

```bash
docker-compose up --build
```

3. Open the apps:
- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/health`

Docker uses MySQL through `DATABASE_URL_DOCKER` in `docker-compose.yml`.

## Deploy Frontend To Vercel

Set the Vercel project Root Directory to `frontend`.

Add these environment variables in Vercel:

- `NEXT_PUBLIC_API_URL` (your deployed backend API URL)
- `NEXT_PUBLIC_SUPABASE_URL=https://tiqforrjgvfnlfvafssj.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_7n2qaeZPUvi4QX40PJGVIQ_p21Gjxhw`
- `DATABASE_URL` (Supabase Postgres connection string, if backend is also deployed)

If you deploy backend outside Docker with Supabase Postgres, use Prisma Postgres scripts:

```bash
npm run prisma:generate:postgres -w backend
npm run prisma:dbpush:postgres -w backend
npm run prisma:seed -w backend
```

## Database

The backend runs Prisma migrations and seed data on startup in the Docker setup.

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