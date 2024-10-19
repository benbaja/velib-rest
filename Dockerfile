FROM node:23-alpine

WORKDIR /usr/src/velib-rest

COPY . .

RUN npm i
RUN npm run build

EXPOSE 8000
CMD [ "node", "dist/index.js" ]