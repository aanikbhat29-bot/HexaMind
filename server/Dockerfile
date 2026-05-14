FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npm install --production
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
