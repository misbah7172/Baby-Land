#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
if [ -n "$DATABASE_URL" ]; then
  # Extract host from DATABASE_URL
  MYSQL_HOST=$(echo $DATABASE_URL | grep -oP 'mysql://[^:]*:[^@]*@\K[^:]*' || echo "mysql")
  MYSQL_PORT=$(echo $DATABASE_URL | grep -oP ':\K[0-9]+(?=/|$)' || echo "3306")
  
  # Wait for MySQL with timeout to avoid blocking healthchecks forever.
  MAX_WAIT_SECONDS=90
  WAITED_SECONDS=0
  while ! nc -z "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; do
    if [ "$WAITED_SECONDS" -ge "$MAX_WAIT_SECONDS" ]; then
      echo "MySQL wait timeout reached (${MAX_WAIT_SECONDS}s). Continuing startup and letting app retries handle it."
      break
    fi
    echo "MySQL not ready, waiting... (${WAITED_SECONDS}s/${MAX_WAIT_SECONDS}s)"
    sleep 1
    WAITED_SECONDS=$((WAITED_SECONDS + 1))
  done

  if nc -z "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; then
    echo "MySQL is ready!"
  fi
fi

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate -w backend || {
  echo "Warning: Prisma generation failed, but continuing..."
}

# Run database migrations
echo "Running database migrations..."
npm run prisma:migrate -w backend || {
  echo "Warning: Database migration failed. This is normal if it's the first run."
  echo "Attempting db push as fallback..."
  npm run prisma:dbpush -w backend || echo "Database sync failed, but continuing..."
}

# Run seed (optional - can fail silently)
echo "Running database seed..."
npm run prisma:seed -w backend || echo "Seed not needed or failed, continuing..."

# Start the backend server
echo "Starting backend server on port ${PORT:-4000}..."
npm run start -w backend
