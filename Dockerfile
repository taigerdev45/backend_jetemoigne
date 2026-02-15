# Étape 1 : Construction (Build)
FROM node:22-alpine AS builder

# Installation des dépendances système pour Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installation de toutes les dépendances (y compris devDeps pour le build)
RUN npm install

# Copie du code source
COPY . .

# Suppression préventive des scripts utilitaires qui pourraient faire échouer le build NestJS
RUN rm -f create-admin.ts create-admin.js

# Génération du client Prisma et Build du projet
RUN npx prisma generate && npm run build

# Étape 2 : Exécution (Runtime)
FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# On ne garde que les dépendances de production pour alléger l'image
RUN npm prune --production

# Exposition du port (Render utilise process.env.PORT)
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
