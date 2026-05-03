FROM oven/bun:1.3.6 AS base

# --- Prune Stage ---
FROM base AS pruner
WORKDIR /app
RUN bun add -g turbo
COPY . .
RUN turbo prune @unievent/web --docker

# --- Installer Stage ---
FROM base AS installer
WORKDIR /app

# First copy json files to install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN bun install --frozen-lockfile

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URLS
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SERVER_URLS
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_URLS=${NEXT_PUBLIC_API_URLS}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_SERVER_URLS=${NEXT_PUBLIC_SERVER_URLS}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Generate Prisma client if needed (since web might depend on db/schema)
RUN bun run db:generate || true

RUN bun run build --filter=@unievent/web

# --- Runner Stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3001

# The standalone build uses a server.js file
CMD ["bun", "server.js"]
