# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app (optional, depending on if you want to run dev server or serve static build)
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
