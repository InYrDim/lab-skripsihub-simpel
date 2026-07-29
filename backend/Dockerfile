FROM node:20.19.5-alpine3.22 AS build

RUN apk add --no-cache openssl
WORKDIR /app
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

COPY package*.json ./
RUN npm ci
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20.19.5-alpine3.22 AS production

RUN apk add --no-cache openssl \
    && npm install --global prisma@5.22.0 \
    && npm cache clean --force
WORKDIR /app
ENV NODE_ENV=production \
    PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/.cache ./.cache

USER node
EXPOSE 3000
CMD ["sh", "-c", "prisma migrate deploy && node dist/main"]
