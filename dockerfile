# Use a lightweight Node.js image for the build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json tsconfig.json vite.config.ts /app/

# Install dependencies
RUN npm install

# Copy application files
COPY . /app/

# Build the production-ready application
RUN npm run build

# Use a lightweight Nginx image for the final stage
FROM nginx:stable-alpine AS production

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a default Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
