# using the official node.js image as base image
FROM node:21-alpine3.18

# set the working directory for the container
WORKDIR /{change}

# copy package.json and package-lock.json to the container
COPY package*.json {change}

# install the dependencies including devDependencies
RUN npm install

# copy the rest of the backend source code
COPY . .

# expose the port for the app
EXPOSE 5000

# command to compile typescript and start the application
CMD ["npm", "run", "devStart"]
