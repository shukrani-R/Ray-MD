# Base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy env file first (so it's available early if needed)
COPY .env .env

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the source code
COPY . .

# Expose the Express port
EXPOSE 3000

# Start the bot
CMD ["node", "control.js"]
