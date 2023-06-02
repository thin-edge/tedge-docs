FROM node:18-alpine

COPY . .

RUN yarn install
RUN npm install -g npm@9.6.7

WORKDIR /docusaurus/tedge
EXPOSE 3000
