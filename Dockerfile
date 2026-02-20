FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies with legacy peer deps to avoid ERESOLVE
# Copy both package manifest and lockfile if present
COPY package*.json ./
COPY .npmrc ./.npmrc
# Fallback to npm install if lockfile is not available in build context
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy artifacts
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["node", "dist/main.js"]
