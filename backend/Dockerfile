FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Reasonable defaults for production deployments. Can be overridden via Fly secrets.
ENV PRISMA_CONNECTION_LIMIT=5
ENV PRISMA_CONNECT_RETRIES=5
ENV PRISMA_CONNECT_BASE_DELAY_MS=1000
ENV FAIL_ON_DB_CONNECT=false

COPY package*.json ./
COPY prisma ./prisma
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates libssl-dev libssl3 \
    && rm -rf /var/lib/apt/lists/* \
    && npm ci --omit=dev \
    && npm i prisma@6.6.0 --no-save

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
CMD ["node", "dist/main"]
