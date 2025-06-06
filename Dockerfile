# Production Dockerfile for Elysia.js API
FROM oven/bun:1-alpine

# Install system dependencies for health checks and network utilities
RUN apk add --no-cache \
    dumb-init \
    curl \
    netcat-openbsd \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S elysia -u 1001

# Copy package.json first for better Docker layer caching
COPY package.json ./

# Copy bun.lockb if it exists
COPY bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production && \
    bun pm cache rm

# Copy application source code
COPY --chown=elysia:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown elysia:nodejs logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER elysia

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Direct startup command
CMD ["dumb-init", "--", "bun", "run", "src/index.ts"] 
