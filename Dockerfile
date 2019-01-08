FROM node:8
WORKDIR /usr/src/app

COPY . .

RUN npm install --unsafe-perm
RUN npm run build

CMD node dist/index.js
