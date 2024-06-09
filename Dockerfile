# Step 1: Build the Angular application
FROM node:16 as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve the application using an NGINX server
FROM nginx:alpine

COPY --from=build-stage /app/dist/life-quality /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
