FROM node:23-alpine

WORKDIR /usr/src/velib-rest/
COPY . .

WORKDIR /usr/src/velib-rest/server/
RUN npm i
RUN npm run build

EXPOSE 8000
ENTRYPOINT [ "node", "dist/index.js" ]