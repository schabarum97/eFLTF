FROM node:18.18-alpine

ENV TZ=America/Sao_Paulo
RUN mkdir -p /home/node/horus

WORKDIR /home/node/efltf

COPY ./package.json ./
COPY ./src ./src

RUN npm install

EXPOSE 3000

CMD ["node", "./src/index.js" ]