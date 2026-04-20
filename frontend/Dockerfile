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

# Copy root level files
COPY package.json package-lock.json ./

# Copy all workspace package.json files
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY database/ database/

# Install all dependencies
RUN npm ci --prefer-offline --no-audit

# Copy frontend source
COPY frontend/app frontend/app
COPY frontend/components frontend/components
COPY frontend/lib frontend/lib
COPY frontend/pages frontend/pages
COPY frontend/public frontend/public
COPY frontend/prisma frontend/prisma
COPY frontend/next.config.ts frontend/tsconfig.json frontend/middleware.ts frontend/
COPY frontend/tailwind.config.ts frontend/postcss.config.mjs frontend/

# Build frontend
RUN npm run build -w frontend

# Runtime stage - minimal Next.js image
FROM base AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy only Next.js standalone build
COPY --from=builder /app/frontend/.next/standalone ./frontend/.next/standalone
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "frontend/.next/standalone/frontend/server.js"]
