# Base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source code
COPY . .

# Expose port for Express
EXPOSE 3000

# Start the bot
CMD ["node", "control.js"]
