FROM node:22-alpine
WORKDIR /app
COPY server.js keygen.js paint.js WALL.md package.json ./
EXPOSE 8787
CMD ["node", "server.js"]
