FROM node:24-bookworm-slim AS base

WORKDIR /app

# Install system dependencies in base layer (reused across stages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Build stage - compile backend
FROM base AS builder

# Copy package manifest
COPY package.json ./

# Install all dependencies
RUN npm install --prefer-offline --no-audit

# Copy source code
COPY . .

# Generate Prisma client and build backend
RUN npm run prisma:generate && npm run build

# Runtime stage - minimal image
FROM base AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Copy package manifest
COPY package.json ./

# Copy runtime dependencies (only production node_modules)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
    CMD curl -f http://localhost:4000/health || exit 1

# Start API immediately for healthchecks; run DB sync in background as best effort.
CMD sh -c "((npm run prisma:migrate || npm run prisma:dbpush) >/tmp/prisma-init.log 2>&1 || true) & exec npm run start"
