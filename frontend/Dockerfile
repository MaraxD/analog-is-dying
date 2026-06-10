
FROM node:18-alpine

# working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the application
COPY . .


# RUN npm run build

# expose the port the app runs on
EXPOSE 3000

# start the development server
CMD ["npm", "start"]
