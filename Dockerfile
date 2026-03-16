# Stage 1: Build the React Application
FROM node:20-slim as build

# Set working directory
WORKDIR /app

# Copy package files for deterministic install
# We only copy the JSON files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Perform a clean, headless installation of dependencies native to the Linux environment
# This prevents Error 126 by ensuring all binaries (like esbuild) are Linux-compatible
RUN npm ci

# Copy the rest of the source code
# (Note: .dockerignore will prevent copying local node_modules from Windows)
COPY . .

# Ensure bin utilities are executable in the Linux environment
RUN chmod -R +x node_modules/.bin

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy custom nginx config for SPA routing
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
