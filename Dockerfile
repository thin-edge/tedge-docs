FROM node:18-alpine
WORKDIR /docusaurus
COPY package*.json yarn.lock ./
RUN yarn install
EXPOSE 3000
ENV DOCUSAURUS_OPTIONS="--host=0.0.0.0"
COPY . .
VOLUME [ "/docusaurus/docs" ]
CMD ["yarn", "run", "start"]
