# Step 1: Use a Node.js base image to build the Angular application
FROM node:14 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the Angular application
RUN npm run build --prod

# Step 7: Use a lightweight web server to serve the Angular application
FROM nginx:alpine

# Step 8: Copy the built application from the previous stage to the nginx html directory
COPY --from=build /app/dist/YOUR_APP_NAME /usr/share/nginx/html

# Step 9: Expose port 80 to access the application
EXPOSE 80

# Step 10: Start nginx server
CMD ["nginx", "-g", "daemon off;"]
