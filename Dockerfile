FROM node:18-alpine

WORKDIR /docusaurus/tedge
COPY package*.json yarn.lock ./
RUN yarn install

EXPOSE 3000

VOLUME [ "/docusaurus/tedge/site/docs" ]
VOLUME [ "/docusaurus/tedge/site" ]

CMD ["yarn", "run", "start"]
