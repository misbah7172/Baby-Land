#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 1
done

echo "MySQL is ready!"

# Try to run migrations, but don't fail if they don't work yet
echo "Attempting to run Prisma migrations..."
npm run prisma:migrate -w backend || echo "Migrations failed, continuing anyway..."

echo "Running seed..."
npm run prisma:seed -w backend || echo "Seed failed, continuing anyway..."

echo "Starting backend server..."
npm run start -w backend
