# Stage 1: build React
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:1.27-alpine
ENV BACKEND_URL=http://backend:5000
# The nginx image runs envsubst on files in /etc/nginx/templates at startup
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
