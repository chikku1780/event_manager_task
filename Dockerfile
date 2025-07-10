# Multi-stage build for Event Manager
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./backend/

# Copy frontend package files  
COPY frontend/package.json frontend/package-lock.json* ./frontend/

# Install root dependencies
RUN npm ci --only=production

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY . .

# Build backend
WORKDIR /app/backend
RUN npm run build

# Build frontend
WORKDIR /app/frontend
# Configure Next.js for standalone output
RUN echo 'const nextConfig = { output: "standalone", typescript: { ignoreBuildErrors: false }, eslint: { ignoreDuringBuilds: false } }; module.exports = nextConfig;' > next.config.js
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 4000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy built frontend (standalone output)
COPY --from=builder /app/frontend/.next/standalone ./frontend
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

# Copy root package.json for scripts
COPY package.json ./

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000 4000

# Create a script to run both services
RUN echo '#!/bin/sh\n\
	echo "Starting Event Manager..."\n\
	echo "Starting backend on port 4000..."\n\
	cd /app/backend && npm start &\n\
	BACKEND_PID=$!\n\
	echo "Starting frontend on port 3000..."\n\
	cd /app/frontend && npm start &\n\
	FRONTEND_PID=$!\n\
	echo "Both services started. Waiting for them to complete..."\n\
	wait $BACKEND_PID $FRONTEND_PID' > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["/app/start.sh"] 