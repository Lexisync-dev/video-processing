# Build Stage
FROM node:20-slim AS build

WORKDIR /app/frontend

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# vite.config.js is configured to output to ../public
# We create the parent directory so the build doesn't fail
RUN mkdir -p /app/public && npm run build

# Serve Stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/public /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
