# syntax=docker/dockerfile:1

###############################################
# Stage 1 — Builder (deps + build + prisma)   #
###############################################
# Debian (bookworm) => OpenSSL 3.0.x, matches Prisma binaryTarget "debian-openssl-3.0.x"
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Prisma engines need openssl at generate/runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install ALL deps (dev included) — needed for nest build + prisma generate
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run prisma:generate \
    && npm run build

# Precompile the DB seed to plain JS so it can run with `node` in the
# production image (ts-node is a devDependency, absent from the runner).
# Output lands in dist/ and is copied into the runner alongside the app.
RUN npx tsc prisma/seed.ts \
    --outDir dist --rootDir prisma \
    --module commonjs --target ES2021 \
    --moduleResolution node --esModuleInterop --skipLibCheck

###############################################
# Stage 2 — Runner (production image)         #
###############################################
FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Prisma schema + migrations (needed for `prisma migrate deploy` at boot)
COPY prisma ./prisma

# Generated Prisma client from the builder (avoids regenerating in runner)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Compiled application
COPY --from=builder /app/dist ./dist

# Railway injects PORT; the app reads it via ConfigService (defaults to 3000)
EXPOSE 3000

# Apply pending migrations then start the server
CMD ["npm", "run", "start:prod:migrate"]
