FROM node:22

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

RUN npx prisma generate

RUN npx prisma migrate dev 
# Expose port
EXPOSE 3000

# Command with hot reload
CMD ["npm", "run", "dev"]
