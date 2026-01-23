# --- Stage 1: Build the App ---
FROM node:25.4.0-alpine3.23 AS builder
WORKDIR /app

# Copy package files first to cache dependencies (faster builds)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project (creates the /dist folder)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (see step 2 below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard web port) inside the container
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
