FROM node:18-bullseye-slim

WORKDIR /app

# Install runtime dependencies
COPY package*.json ./
RUN npm ci --production

# Copy source and build dependencies (we rely on tsc build step in CI or during image build)
COPY . .

# Build TypeScript to dist
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]