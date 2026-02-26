# ──────────────────────────────────────────────
# Stage 1: deps — install production deps
# ──────────────────────────────────────────────
FROM node:lts-alpine AS deps

WORKDIR /frontend

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Only prod deps
RUN pnpm install --frozen-lockfile --prod

# ──────────────────────────────────────────────
# Stage 2: builder — compiles app
# ──────────────────────────────────────────────
FROM node:lts-alpine AS builder

WORKDIR /frontend

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Instala all deps
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# ──────────────────────────────────────────────
# Stage 3: runner — final image
# ──────────────────────────────────────────────
FROM node:lts-alpine AS runner

# System user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /frontend

# Copy only necessary
COPY --from=builder  --chown=appuser:appgroup /frontend/.output   ./.output
COPY --from=deps     --chown=appuser:appgroup /frontend/node_modules ./node_modules
COPY --from=builder  --chown=appuser:appgroup /frontend/package.json ./package.json

# Change user
USER appuser

# TanStack Start listens on 3000
EXPOSE 3000

# Start SSR Server
CMD ["node", ".output/server/index.mjs"]
