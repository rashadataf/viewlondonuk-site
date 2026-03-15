# ── Base ──────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# ── Development ──────────────────────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# ── Production build ─────────────────────────────────────────────────────────
FROM base AS builder
ENV NODE_ENV=production
RUN npm run build

# ── Production runtime ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

EXPOSE 3010
CMD ["npm", "run", "start"]
