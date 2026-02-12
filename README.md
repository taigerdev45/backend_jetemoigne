# Jetemoigne-TV Backend

Documentation technique pour le backend de la plateforme **Jetemoigne-TV**.

## 🚀 Technologies
*   **Framework** : [NestJS](https://nestjs.com/) (Node.js)
*   **Base de données** : PostgreSQL via [Supabase](https://supabase.com/)
*   **ORM** : [Prisma](https://www.prisma.io/)
*   **Authentification** : JWT (JSON Web Tokens)
*   **Documentation** : Swagger (OpenAPI)
*   **Hébergement** : [Render](https://render.com/) (Docker)

## 🛠️ Installation et Lancement

```bash
# 1. Installation des dépendances
$ npm install

# 2. Génération du client Prisma
$ npx prisma generate

# 3. Lancement en mode développement
$ npm run start:dev

# 4. Build pour la production
$ npm run build
```

## 🔐 Variables d'Environnement (.env)
Copiez les informations de votre tableau de bord Supabase selon le guide suivant :
*   `DATABASE_URL` : URL avec Transaction Pooler (port 6543) + `?pgbouncer=true`
*   `DIRECT_URL` : URL en Session Mode (port 5432)
*   `JWT_SECRET` : Clé de signature des tokens
*   `SUPABASE_URL` : URL de l'API Supabase
*   `SUPABASE_KEY` : Clé anonyme publique

## 📖 Documentation de l'API (Swagger)
Une fois le serveur lancé, la documentation interactive est disponible sur :
👉 **http://localhost:3001/api/docs** (Local)
👉 **[https://backend-jetemoigne-458j.onrender.com/api/docs](https://backend-jetemoigne-458j.onrender.com/api/docs)** (En ligne)

L'équipe Frontend peut tester les endpoints directement depuis cette interface.

## 🏗️ Architecture des Dossiers
*   `src/auth` : Gestion des utilisateurs et connexion.
*   `src/testimonies` : Back-office et points d'entrée pour les témoignages.
*   `src/programs` : Gestion des vidéos, live et programmes TV.
*   `src/donations` : Gestion des transactions et des dons.
*   `prisma/` : Schéma de la base de données et migrations.

---
© 2026 Jetemoigne-TV Backend Team
