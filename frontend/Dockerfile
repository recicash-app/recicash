# Official Node 20
FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy the rest of the code
COPY . .

# Expose React port
EXPOSE 3000

# Set path for node_modules
ENV PATH=/app/node_modules/.bin:$PATH

# Default command to run the dev server
CMD ["npm", "run", "dev"]