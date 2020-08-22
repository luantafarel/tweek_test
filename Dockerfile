FROM node:10
# Create app directory
RUN mkdir -p /usr/backend
WORKDIR /usr/backend
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./ ./
RUN yarn
RUN yarn global add sequelize-cli pg sequelize
# RUN sequelize db:migrate
EXPOSE 3000
CMD  ["yarn", "start"] 
