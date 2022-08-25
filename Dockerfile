FROM node:14-alpine
# install zip
RUN apk update && apk add zip
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN DISABLE_ESLINT_PLUGIN=true npm install
# explicitly tell docker to copy .env file or it won't be copied to image
# COPY .env .
EXPOSE 3000
CMD [ "npm", "run", "start" ]