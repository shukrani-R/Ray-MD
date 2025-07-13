# Base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy .env file first to container
COPY .env .env

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port for Express server
EXPOSE 3000

# Command to run the bot
CMD ["node", "control.js"]
