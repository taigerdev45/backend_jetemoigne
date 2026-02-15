# 📕 Documentation Technique Complète : Je Temoigne-TV Backend

Ce document constitue la source unique de vérité pour le développement, la maintenance et l'exploitation du backend Je Temoigne-TV.

---

## 🏗️ 1. Architecture & Fondations

### Stack Technique
*   **Langage** : TypeScript
*   **Framework** : NestJS (Modular architecture)
*   **Base de Données** : PostgreSQL (Hébergé sur Supabase)
*   **ORM** : Prisma (Type-safe database access)
*   **Hébergement** : Render (Web Service + Render Blueprint)
*   **Documentation** : Swagger API (Accessible via `/api/docs`)

### Structure du Projet
Le projet est décomposé en modules spécialisés :
*   `AuthModule` : Gestion des accès.
*   `PublicHubModule` : Agrégation pour l'expérience visiteur.
*   `AdminHubModule` : Console de gestion et workflows complexes.
*   `StorageModule` : Couche d'abstraction pour Supabase Storage.
*   `NotificationsModule` : Moteur temps réel (WebSockets).
*   `Support`, `Programs`, `Testimonies`, `Library`, `Ads`, `Projects` : Modules métiers.

---

## 🔐 2. Sécurité & Authentification (RBAC)

### Authentification JWT
Toutes les requêtes privées doivent inclure un header `Authorization: Bearer <TOKEN>`.

### Rôles et Permissions
Le système utilise un garde de rôles (`RolesGuard`) :
*   **`super_admin`** : Contrôle total (y compris suppressions critiques).
*   **`admin`** : Gestion quotidienne, validation, accès dashboard.
*   **`manager`** : Focalisé sur la création de contenu (Programmes, Livres, Pubs).
*   **`accountant`** : Accès exclusif aux flux financiers (Dons et Transactions).

---

## 📁 3. Gestion des Médias (Supabase Storage)

Le backend transforme les fichiers reçus (`multipart/form-data`) en URLs pérennes.

### Compartiments (Buckets)
| Nom du Bucket | Usage | Visibilité |
| :--- | :--- | :--- |
| **`testimonies-media`** | Vidéos et photos des fidèles. | Public |
| **`transaction-proofs`** | Captures d'écran Mobile Money. | Public (pour vérification) |
| **`books-files`** | Fichiers PDF des ouvrages. | Public |
| **`public-assets`** | Miniatures, bannières, logos, couvertures. | Public |

---

## ⚡ 4. Temps Réel & Notifications (WebSockets)

Utilisation de **Socket.io** pour une interactivité instantanée.

*   **Endpoint** : `wss://[votre-url]/notifications`
*   **Namespace** : `/notifications`
*   **Sécurité** : Connexion uniquement via JWT.
*   **Événements clés** :
    *   `testimony_received` : Alerte les admins d'un nouveau témoignage.
    *   `donation_received` : Alerte dès validation d'un don MM.

---

## 📊 5. Analyses & Business Intelligence

Le module d'analyse fournit des agrégations via Prisma :
*   **Finances** : Revenus mensuels cumulés et par projet.
*   **Engagement** : Top 5 des programmes (clics/vues) et distribution par thématique.
*   **Opérations** : Statistiques sur le volume de modération (validés vs rejetés).

---

## �️ 6. Guide des Endpoints API

### Expérience Publique (`/api/v1/...`)
*   `GET /public-hub/home` : Résumé complet pour la home page.
*   `POST /testimonies` : Soumission avec upload média.
*   `POST /support/donations` : Envoi de preuve de don (screenshot).
*   `GET /programs` : Catalogue filtrable.

### Expérience Admin (`/api/v1/admin/...`)
*   `GET /admin/hub/stats` : KPI temps réel.
*   `PATCH /admin/hub/transactions/:id/validate` : Workflow comptable.
*   `PATCH /admin/hub/testimonies/:id/moderate` : Workflow de modération.
*   `POST /admin/content/books` : Création complexe (PDF + Couverture).

---

## 🚀 7. Déploiement & Maintenance

### Variables d'Environnement
*   `DATABASE_URL` : Connexion pooling pour Supabase.
*   `DIRECT_URL` : Connexion directe pour les migrations Prisma.
*   `SUPABASE_URL` & `SUPABASE_KEY` : Accès API Storage.
*   `JWT_SECRET` : Clé de signature des tokens.

### Maintenance
1.  **Changement de schéma** : `npx prisma generate` après modification.
2.  **Logs** : Consultables via le tableau de bord Render.
3.  **Build** : Le script de build NestJS génère le code optimisé dans `/dist`.

---

> [!IMPORTANT]
> Ne jamais supprimer manuellement des fichiers dans Supabase Storage sous peine de briser les liens stockés en base de données. Utilisez toujours les endpoints DELETE de l'API.
---

## 🧪 8. Guide de Recette (Tests Manuels)

### A. Utilisation de Swagger (Le plus simple)
Idéal pour tester rapidement sans rien installer.
1.  **Accès** : Ouvrez [Swagger UI](https://backend-jetemoigne-458j.onrender.com/api/docs).
2.  **Authentification** : 
    *   Utilisez l'endpoint `POST /api/v1/auth/login` pour obtenir un `access_token`.
    *   Remontez en haut de la page, cliquez sur le bouton vert **Authorize**.
    *   Collez le token et validez.
3.  **Tester un endpoint** :
    *   Cliquez sur l'endpoint souhaité (ex: `POST /api/v1/testimonies`).
    *   Cliquez sur **Try it out**.
    *   Remplissez les champs (pour le champ `file`, sélectionnez un fichier sur votre PC).
    *   Cliquez sur le gros bouton bleu **Execute**.

### B. Utilisation de Postman
Idéal pour des tests plus structurés et répétitifs.
1.  **Import** : Dans Postman, cliquez sur **Import** et glissez le fichier `JeTemoigne_V1.2.postman_collection.json` (à la racine du projet).
2.  **Configuration** :
    *   La variable `base_url` est déjà réglée sur l'URL Render.
    *   Pour les routes protégées, allez dans l'onglet **Auth**, choisissez **Bearer Token**, et collez votre token.
3.  **Upload de fichiers** :
    *   Dans l'onglet **Body**, sélectionnez **form-data**.
    *   Dans la colonne `KEY`, changez le type de `Text` à `File` pour le champ `file`.
    *   Sélectionnez votre fichier local et envoyez.
