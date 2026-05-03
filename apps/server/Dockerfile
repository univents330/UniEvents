# Base image
FROM oven/bun:1.3-slim AS base
WORKDIR /app

# Prune phase
FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @unievent/server --docker

# Installer phase
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile --ignore-scripts

# Build phase
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client
RUN bun run db:generate

# Build the server
RUN bun run build --filter=@unievent/server

# Runner phase
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Expose the port
EXPOSE 3000

# Run the app
WORKDIR /app/apps/server
CMD ["bun", "run", "dist/index.mjs"]
