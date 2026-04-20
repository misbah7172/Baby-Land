FROM node:22.14.0-bookworm-slim AS deps
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY tsconfig.base.json ./

RUN npm ci

FROM node:22.14.0-bookworm-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_ADMIN_PATH
ARG NEXT_PUBLIC_ADMIN_EMAIL
ARG NEXT_PUBLIC_ADMIN_PASSWORD_HASH

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_ADMIN_PATH=${NEXT_PUBLIC_ADMIN_PATH}
ENV NEXT_PUBLIC_ADMIN_EMAIL=${NEXT_PUBLIC_ADMIN_EMAIL}
ENV NEXT_PUBLIC_ADMIN_PASSWORD_HASH=${NEXT_PUBLIC_ADMIN_PASSWORD_HASH}

RUN npm run build -w frontend

FROM node:22.14.0-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/frontend/.next ./frontend/.next
COPY --from=build /app/frontend/public ./frontend/public
COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY package.json ./
COPY frontend/package.json frontend/package.json

EXPOSE 3000

CMD ["sh", "-c", "npm run start -w frontend"]