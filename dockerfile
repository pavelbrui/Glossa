# Development Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json vite.config.ts /app/
RUN npm install

COPY . /app/

# Expose Vite development server port
EXPOSE 5173

CMD ["npm", "run", "start", "--", "--host"]
