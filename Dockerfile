# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port if needed (e.g. Express app for QR)
EXPOSE 3000

# Run the bot
CMD ["node", "control.js"]
