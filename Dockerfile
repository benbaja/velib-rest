FROM node:23-alpine

WORKDIR /usr/src/velib-rest/
COPY . .
RUN mkdir osmfiles
ADD https://download.geofabrik.de/europe/france/ile-de-france-latest.osm.pbf /usr/src/velib-rest/osmfiles/

WORKDIR /usr/src/velib-rest/server/
RUN npm i
RUN npm run build

EXPOSE 8000
ENTRYPOINT [ "node", "dist/index.js" ]