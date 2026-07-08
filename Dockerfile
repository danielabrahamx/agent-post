FROM node:22-alpine
WORKDIR /app
COPY server.js keygen.js paint.js WALL.md package.json ./
EXPOSE 8787
# mount a volume at /app/data or every post dies with the container
VOLUME /app/data
CMD ["node", "server.js"]
