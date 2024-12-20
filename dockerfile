ARG NODE_VER=18

# 1. Install dependencies only when needed
FROM node:$NODE_VER AS deps
WORKDIR /home/node
COPY package.json package-lock.json
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 npm ci
COPY . .

WORKDIR /home/node
FROM deps as builder
WORKDIR /home/node
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 npm run build

FROM node:$NODE_VER-slim
WORKDIR /home/node

ENV PORT=5173

ENV PATH="/home/node/node_modules/.bin:$PATH"
CMD ["npm","run", "dev"]
