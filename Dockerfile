# ---- Build stage ----
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.ts index.html ./
COPY public/ ./public/
COPY src/ ./src/

RUN pnpm build

# ---- Serve stage ----
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

RUN mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx && \
    chmod -R 755 /var/cache/nginx /var/run/nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=2 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

USER nginx

CMD ["nginx", "-g", "daemon off;"]
