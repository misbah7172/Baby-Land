#!/bin/bash
set -e

echo "Starting backend bootstrap..."

# Optional short DB readiness probe to avoid immediate migration failures.
if [ -n "$DATABASE_URL" ]; then
  MYSQL_HOST=$(echo "$DATABASE_URL" | grep -oP 'mysql://[^:]*:[^@]*@\K[^:/?]+' || true)
  MYSQL_PORT=$(echo "$DATABASE_URL" | grep -oP '@[^:/?]+:\K[0-9]+' || true)
  MYSQL_HOST=${MYSQL_HOST:-mysql}
  MYSQL_PORT=${MYSQL_PORT:-3306}

  MAX_WAIT_SECONDS=25
  WAITED_SECONDS=0
  while ! nc -z "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; do
    if [ "$WAITED_SECONDS" -ge "$MAX_WAIT_SECONDS" ]; then
      echo "DB probe timeout (${MAX_WAIT_SECONDS}s). Continuing startup."
      break
    fi
    echo "DB not ready yet... (${WAITED_SECONDS}s/${MAX_WAIT_SECONDS}s)"
    sleep 1
    WAITED_SECONDS=$((WAITED_SECONDS + 1))
  done
fi

# Migrations are best-effort and should not block service health.
echo "Running best-effort DB migration..."
npm run prisma:migrate -w backend >/tmp/prisma-migrate.log 2>&1 || {
  echo "Migration skipped/failed (non-blocking)."
}

echo "Starting backend server on port ${PORT:-4000}..."
exec node backend/dist/index.js
