# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files (source, audios, session, plugins, etc.)
COPY . .

# Create session dir if not exists (useful for QR-based bots)
RUN mkdir -p session

# Expose port (optional if using Express for QR site)
EXPOSE 3000

# Start the bot
CMD ["node", "control.js"]
