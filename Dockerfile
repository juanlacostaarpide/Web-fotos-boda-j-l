# ---- Etapa 1: build del frontend (React + Vite) ----
FROM node:20-bookworm-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---- Etapa 2: servidor (Express + ffmpeg) ----
FROM node:20-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev
COPY server/src ./src
COPY --from=frontend /app/dist ./public

VOLUME ["/app/server/data"]
ENV PORT=8080
EXPOSE 8080
CMD ["node", "src/index.js"]
