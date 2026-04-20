FROM node:22.14.0-bookworm-slim AS deps
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY tsconfig.base.json ./
COPY database database

RUN npm ci

FROM node:22.14.0-bookworm-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run prisma:generate -w backend && npm run build -w backend

FROM node:22.14.0-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install netcat for connection checking
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/database ./database
COPY package.json ./
COPY backend/package.json backend/package.json
COPY docker/entrypoint.backend.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]