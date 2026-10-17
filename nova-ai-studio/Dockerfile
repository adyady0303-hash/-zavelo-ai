FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY nova-ai-studio/package*.json ./
RUN npm install --omit=dev
COPY nova-ai-studio/ ./
ENV NODE_ENV=production
ENV PORT=3000
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "start"]
