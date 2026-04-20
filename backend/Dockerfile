FROM node:24-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install system dependencies in base layer (reused across stages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Build stage - compile backend
FROM base AS builder

# Copy root level files
COPY package.json package-lock.json ./

# Copy all workspace package.json files
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY database/ database/

# Install all dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY backend/src backend/src
COPY backend/tsconfig.json backend/
COPY database/prisma database/prisma

# Generate Prisma client and build backend
RUN npm run prisma:generate -w backend && npm run build -w backend

# Runtime stage - minimal image
FROM base AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Copy runtime dependencies (only production node_modules)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/database/prisma ./database/prisma

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Run migrations and start server
CMD npm run prisma:generate -w backend && npm run prisma:migrate -w backend && npm run start -w backend
