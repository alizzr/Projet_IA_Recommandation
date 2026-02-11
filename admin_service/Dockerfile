# Étape 1 : Construction (Build)
FROM node:18-alpine as build
WORKDIR /app

# --- CHANGEMENT ICI ---
# On dit à Docker de copier le package.json depuis le sous-dossier "frontend"
COPY frontend/package*.json ./

# On installe les dépendances
RUN npm install

# --- CHANGEMENT ICI ---
# On copie tout le contenu du dossier "frontend" vers le dossier de travail Docker
COPY frontend/ .

# Integation Environnement
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# On lance la construction
RUN npm run build

# Étape 2 : Serveur Web (Nginx)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Le nginx.conf, lui, est resté à la racine (à côté du Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]