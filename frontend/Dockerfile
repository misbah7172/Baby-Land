FROM node:24-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Build stage - compile frontend
FROM base AS builder

# Copy package manifest
COPY package.json ./

# Install all dependencies
RUN npm install --prefer-offline --no-audit

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Runtime stage - minimal Next.js image
FROM base AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy only Next.js standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
