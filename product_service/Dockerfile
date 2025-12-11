FROM node:18-alpine

WORKDIR /app

# Copier juste package.json et package-lock.json
COPY package*.json ./

RUN npm install --production

# Copier le reste du projet
COPY . .

EXPOSE 5002

CMD ["node", "server.js"]
