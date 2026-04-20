#!/bin/bash
set -e

PRISMA_PROVIDER=${PRISMA_PROVIDER:-postgres}

if [ "$PRISMA_PROVIDER" = "mysql" ]; then
  echo "Waiting for MySQL to be ready..."
  while ! nc -z mysql 3306; do
    sleep 1
  done
  echo "MySQL is ready!"
fi

# For local Docker MySQL we use db push to keep startup resilient even when migrations are not tracked.
# For production-style Postgres deployments we run migrate deploy.
if [ "$PRISMA_PROVIDER" = "mysql" ]; then
  echo "Applying MySQL schema with Prisma db push..."
  npm run prisma:dbpush:mysql -w backend || echo "MySQL db push failed, continuing anyway..."
else
  echo "Applying Postgres migrations..."
  npm run prisma:migrate:postgres -w backend || echo "Postgres migrations failed, continuing anyway..."
fi

echo "Running seed..."
npm run prisma:seed -w backend || echo "Seed failed, continuing anyway..."

echo "Starting backend server..."
npm run start -w backend
