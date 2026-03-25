FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV MONGODB_URI=mongodb://mongodb:27017/lulimi-lingo
ENV JWT_SECRET=your-secret-key-change-in-production

# Start the app
CMD ["node", "src/server.js"]
