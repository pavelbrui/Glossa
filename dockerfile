# Use a lightweight Node.js image as the base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json tsconfig.json vite.config.ts /app/

# Copy application files
COPY . /app/

# Install dependencies
RUN npm install

# Build the frontend and backend
RUN npm run build

# Use a lightweight web server image for serving the built frontend
FROM nginx:stable-alpine AS production

# Copy the built application from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration for handling WebSocket and serving static files
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port Nginx will serve on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
