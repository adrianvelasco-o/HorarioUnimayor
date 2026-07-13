# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set environment variables for build time
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy built application and public files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npx", "next", "start", "-p", "3001"]
