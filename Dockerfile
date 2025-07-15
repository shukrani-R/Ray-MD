FROM node:lts-bullseye

# Install system dependencies
RUN apt-get update && \
  apt-get install -y ffmpeg imagemagick webp && \
  npm install -g pm2 && \
  rm -rf /var/lib/apt/lists/*

# Clone your bot repo
RUN git clone https://github.com/shukrani-R/Ray-MD /root/ray_bot

# Set working directory
WORKDIR /root/ray_bot/

# Copy only package.json & install deps
COPY package.json .
RUN npm install --legacy-peer-deps

# Copy remaining source code
COPY . .

# Expose the bot port (if needed for webhook or GUI)
EXPOSE 5000

# Start the bot using npm
CMD ["npm", "run", "ray"]
