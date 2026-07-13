# Stage 1: Build
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

# Stage 2: Runner
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src/prisma ./src/prisma
COPY --from=builder /usr/src/app/src/scripts ./src/scripts
COPY src/ ./src
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh && mkdir -p src/logs

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
