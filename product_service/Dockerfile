# On utilise une image légère de Node.js
FROM node:18-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# On crée le package.json s'il n'existe pas (pour éviter les erreurs)
RUN npm init -y

# On installe les librairies nécessaires
RUN npm install express cors

# On copie tout le code
COPY . .

# On ouvre le port 5002
EXPOSE 5002

# Commande de démarrage
CMD ["node", "server.js"]