# Étape 1 : Build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Étape 2 : Serveur léger
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Config simple car c'est la racine "/"
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]