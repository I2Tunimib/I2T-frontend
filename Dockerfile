FROM node:20-alpine AS builder

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-pip

# Add a work directory
WORKDIR /app

# Cache and Install dependencies first (for better Docker layer caching)
COPY package.json package-lock.json* ./

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN npm ci --only=production=false

# Copy app files (excluding node_modules)
COPY src ./src
COPY public ./public
COPY tsconfig.json tsconfig.extend.json vite.config.ts index.html ./

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.27-alpine AS production
ENV NODE_ENV=production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
