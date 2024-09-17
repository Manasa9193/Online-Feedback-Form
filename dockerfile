# Use the official Node.js image from the Docker Hub
FROM node:18
 
# Set the working directory in the container
WORKDIR /Capsule
 
# Install Apache2 (optional, remove if not needed)
RUN apt-get update -y && \
    apt-get install -y apache2
 
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
 
# Install dependencies
RUN npm install
 
# Copy the rest of your application's code to the working directory
COPY . .
 
 
# Start the application
CMD ["npm", "start"]