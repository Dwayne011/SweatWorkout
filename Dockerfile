# Production image for the Project PB backend: the Express server proxies Gemini
# (server-side key), verifies Firebase ID tokens, and serves the built web app.
# Builds the frontend + the server bundle, then serves both on $PORT (Cloud Run
# injects it; server.ts reads process.env.PORT).
FROM node:20-slim

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Build: PWA assets + vite (frontend → dist/) + esbuild (server → dist/server.cjs).
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Documentation only — Cloud Run routes $PORT to the container regardless.
EXPOSE 8080

# `npm start` = node dist/server.cjs, which listens on process.env.PORT.
CMD ["npm", "start"]
