# Dockerfile pour le déploiement sur Render
FROM node:22-alpine

# Installation des dépendances système nécessaires pour Prisma sur Alpine
RUN apk add --no-cache openssl

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances
# On copie les fichiers de package séparément pour profiter du cache Docker
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances incluant les devDeps pour le build
RUN npm install

# Copie du reste des fichiers
COPY . .

# Fix des permissions pour tous les binaires locaux et génération du client Prisma
RUN chmod -R +x node_modules/.bin && npx prisma generate

# Build de l'application NestJS
RUN npm run build

# Nettoyage des dépendances de développement pour réduire la taille de l'image
RUN npm prune --production

# Exposition du port (Render utilise process.env.PORT)
EXPOSE 3001

# Commande de démarrage
# On utilise start:prod qui lance node dist/main
CMD ["npm", "run", "start:prod"]
