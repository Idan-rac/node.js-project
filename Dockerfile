FROM node:latest


WORKDIR /usr/src/app

COPY package.json ./

COPY src ./src

RUN npm ci --omit=dev || npm install --omit=dev

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
