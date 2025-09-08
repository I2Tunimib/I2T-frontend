FROM node:20-alpine AS builder
# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json .
# Clear npm cache and rebuild native dependencies to fix version conflicts
# Copy app files
COPY . .

RUN npm cache clean --force
RUN npm install --legacy-peer-deps
# Rebuild native dependencies to ensure compatibility
RUN npm rebuild
# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.25-alpine AS production
ENV NODE_ENV=production
# Copy built assets from builder
COPY --from=builder ./app/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
