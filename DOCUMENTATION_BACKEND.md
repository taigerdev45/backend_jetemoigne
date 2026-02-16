# 📕 Documentation API Complète : Je Temoigne-TV Backend

Ce document constitue la référence technique complète pour l'utilisation, le développement et la maintenance du backend Je Temoigne-TV.

---

## 📑 Table des Matières

1. [Architecture & Stack Technique](#architecture--stack-technique)
2. [Sécurité & Authentification](#sécurité--authentification)
3. [Gestion des Médias](#gestion-des-médias)
4. [Notifications Temps Réel](#notifications-temps-réel)
5. [API Routes - Vue d'ensemble](#api-routes---vue-densemble)
6. [Authentification (Auth)](#authentification-auth)
7. [Hub Public](#hub-public)
8. [Témoignages](#témoignages)
9. [Support & Donations](#support--donations)
10. [Programmes](#programmes)
11. [Projets](#projets)
12. [Bibliothèque](#bibliothèque)
13. [Publicités](#publicités)
14. [Admin - Dashboard](#admin---dashboard)
15. [Admin - Témoignages](#admin---témoignages)
16. [Admin - Transactions](#admin---transactions)
17. [Admin - Gestion de Contenu](#admin---gestion-de-contenu)
18. [Codes d'Erreur](#codes-derreur)
19. [Déploiement & Variables d'Environnement](#déploiement--variables-denvironnement)

---

## 🏗️ Architecture & Stack Technique

### Stack
- **Langage** : TypeScript
- **Framework** : NestJS (Architecture modulaire)
- **Base de Données** : PostgreSQL (Hébergé sur Supabase)
- **ORM** : Prisma (Accès type-safe)
- **Storage** : Supabase Storage (Buckets S3-compatible)
- **Hébergement** : Render (Web Service)
- **Documentation** : Swagger/OpenAPI (`/api/docs`)
- **Notifications** : Socket.IO (WebSockets)
- **Préfixe API Global** : Tous les endpoints sont préfixés par `/api/v1` (configuré globalement dans `main.ts`).

### Structure Modulaire
```
src/
├── auth/                  # Authentification JWT & Guards
├── public-hub/            # Agrégation données publiques
├── admin-hub/             # Dashboard & Analytics admin
├── testimonies/           # Gestion témoignages
├── support/               # Dons, bénévoles, partenariats
├── programs/              # Programmes TV (vidéos, podcasts)
├── projects/              # Projets & milestones
├── library/               # Livres & ressources
├── ads/                   # Publicités
├── storage/               # Abstraction Supabase Storage
└── notifications/         # Moteur WebSocket
```

---

## 🔐 Sécurité & Authentification

### Authentification JWT

Toutes les routes protégées nécessitent un header :
```
Authorization: Bearer <votre_token_jwt>
```

### Rôles & Permissions (RBAC)

| Rôle | Permissions | Use Cases |
|------|------------|-----------|
| **super_admin** | Accès complet + suppressions critiques | Gestion globale plateforme |
| **admin** | Dashboard, modération, validation | Gestion quotidienne |
| **manager** | Création contenu (Programmes, Livres, Ads) | Équipe éditoriale |
| **accountant** | Transactions, dons, finances | Comptabilité |
| **observer** | Lecture seule dashboard | Stagiaires, consultants |

### Workflow d'Authentification

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Supabase
    
    Client->>API: POST /auth/login {email, password}
    API->>Supabase: Vérifie credentials
    Supabase-->>API: Profile + Auth data
    API-->>Client: {access_token, user}
    
    Client->>API: GET /admin/dashboard (Authorization: Bearer token)
    API->>API: Valide JWT + vérifie rôle
    API-->>Client: Dashboard data
```

---

## 📁 Gestion des Médias

### Buckets Supabase Storage

| Bucket | Usage | Taille Max | Formats Acceptés |
|--------|-------|-----------|------------------|
| `testimonies-media` | Vidéos/photos témoignages | 50 MB | jpg, png, mp4, webm |
| `transaction-proofs` | Captures Mobile Money | 10 MB | jpg, png, pdf |
| `books-files` | PDFs ouvrages | 20 MB | pdf |
| `public-assets` | Miniatures, logos, bannières | 5 MB | jpg, png, svg |

### Workflow Upload

1. Client envoie fichier via `multipart/form-data`
2. Backend valide format et taille
3. Upload sur Supabase avec UUID unique
4. Retour URL publique persistante
5. URL stockée en base de données

---

## ⚡ Notifications Temps Réel

### Configuration WebSocket

- **URL** : `wss://backend-jetemoigne-458j.onrender.com`
- **Namespace** : `/notifications`
- **Auth** : JWT obligatoire (query param `token`)

### Événements Disponibles

| Événement | Payload | Déclencheur |
|-----------|---------|-------------|
| `testimony_received` | `{id, authorName, title}` | Nouveau témoignage soumis |
| `donation_received` | `{id, amount, donorName}` | Nouveau don enregistré |
| `transaction_validated` | `{id, amount, validatedBy}` | Admin valide transaction |

### Exemple Connexion (Client)

```javascript
import io from 'socket.io-client';

const socket = io('https://backend-jetemoigne-458j.onrender.com/notifications', {
  query: { token: 'votre_jwt_token' }
});

socket.on('testimony_received', (data) => {
  console.log('Nouveau témoignage:', data);
  // Afficher notification UI
});
```

---

## 🗺️ API Routes - Vue d'ensemble

### Routes Publiques (Sans Auth)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/v1/public-hub/home` | Données complètes page d'accueil |
| `POST` | `/api/v1/testimonies` | Soumettre témoignage (+ upload) |
| `GET` | `/api/v1/testimonies/public` | Liste témoignages validés |
| `POST` | `/api/v1/support/donations` | Enregistrer don (+ preuve) |
| `POST` | `/api/v1/support/volunteers` | Candidature bénévole |
| `POST` | `/api/v1/support/partners` | Proposition partenariat |
| `GET` | `/api/v1/programs` | Catalogue programmes |
| `GET` | `/api/v1/programs/:slug` | Détail programme |
| `GET` | `/api/v1/projects` | Liste projets actifs |
| `GET` | `/api/v1/library/books` | Catalogue livres |
| `POST` | `/api/v1/library/books/:id/purchase` | Achat livre |

### Routes Admin (Auth Requise)

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/v1/admin/dashboard` | admin+ | Analytics & KPIs |
| `GET` | `/api/v1/admin/testimonies` | admin+ | Liste tous témoignages |
| `PATCH` | `/api/v1/admin/testimonies/:id` | admin+ | Modération témoignage |
| `GET` | `/api/v1/admin/transactions` | accountant+ | Liste transactions |
| `PATCH` | `/api/v1/admin/transactions/:id/validate` | accountant+ | Validation transaction |
| `POST` | `/api/v1/admin/content/programs` | manager+ | Créer programme |
| `POST` | `/api/v1/admin/content/books` | manager+ | Créer livre (+ PDF) |
| `POST` | `/api/v1/admin/content/ads` | manager+ | Créer publicité |

---

## 🔑 Authentification (Auth)

### `POST /api/v1/auth/login`

**Description** : Authentification utilisateur et génération JWT.

**Body** :
```json
{
  "email": "admin@jetemoigne.tv",
  "password": "VotreMotDePasse123!"
}
```

**Réponse 200** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "admin@jetemoigne.tv",
    "fullName": "Admin Principal",
    "role": "super_admin",
    "avatarUrl": null
  }
}
```

**Erreurs** :
- `401 Unauthorized` : Identifiants incorrects
- `403 Forbidden` : Compte désactivé/supprimé

---

### `POST /api/v1/auth/register`

**Description** : Inscription nouveau compte (admin+).

**Auth** : Requiert rôle `admin` ou `super_admin`

**Body** :
```json
{
  "email": "nouveau@jetemoigne.tv",
  "password": "MotDePasse123!",
  "fullName": "Nouvel Utilisateur",
  "role": "observer"
}
```

**Réponse 201** :
```json
{
  "id": "uuid-nouvel-utilisateur",
  "email": "nouveau@jetemoigne.tv",
  "fullName": "Nouvel Utilisateur",
  "role": "observer"
}
```

---

## 🏠 Hub Public

### `GET /api/v1/public-hub/home`

**Description** : Agrégation complète pour page d'accueil (programmes featured, témoignages, projets actifs, stats).

**Headers** : Aucun (public)

**Réponse 200** :
```json
{
  "featuredPrograms": [
    {
      "id": "uuid",
      "title": "Témoignage du Dimanche",
      "slug": "temoignage-dimanche",
      "description": "Histoires inspirantes de foi",
      "category": "temoignage_live",
      "format": "video",
      "thumbnailUrl": "https://...",
      "videoUrl": "https://...",
      "viewsCount": "15234",
      "publishedAt": "2026-02-10T18:00:00Z"
    }
  ],
  "latestTestimonies": [
    {
      "id": "uuid",
      "title": "Ma guérison miraculeuse",
      "contentText": "Extrait...",
      "mediaType": "video",
      "mediaUrl": "https://...",
      "createdAt": "2026-02-15T21:12:02Z"
    }
  ],
  "activeProjects": [
    {
      "id": "uuid",
      "title": "Construction Orphelinat",
      "vision": "Offrir un foyer sûr...",
      "goalAmount": "50000000",
      "currentAmount": "12500000",
      "progressPercent": 25,
      "coverImageUrl": "https://..."
    }
  ],
  "stats": {
    "totalPrograms": 45,
    "totalTestimonies": 328,
    "totalProjects": 5,
    "totalBooksDownloaded": 1542
  }
}
```

---

## 📝 Témoignages

### `POST /api/v1/testimonies`

**Description** : Soumission publique témoignage avec upload média optionnel.

**Content-Type** : `multipart/form-data`

**Body** :
```
authorName: Jean Dupont
authorEmail: jean@example.com
title: Mon témoignage de guérison
contentText: Il y a 6 mois, j'étais gravement malade...
mediaType: video
file: [fichier MP4, max 50MB]
```

**Réponse 201** :
```json
{
  "id": "1ef6b940-a23c-4749-b4c6-f512992009fd",
  "authorName": "Jean Dupont",
  "authorEmail": "jean@example.com",
  "title": "Mon témoignage de guérison",
  "contentText": "Il y a 6 mois...",
  "mediaUrl": "https://zpetopjtlmnkzmhpmqmm.supabase.co/storage/v1/object/public/testimonies-media/a8d15739-4a47-440e-b4d1-1f1cd8e60e43.mp4",
  "mediaType": "video",
  "status": "recu",
  "adminNotes": null,
  "reviewedBy": null,
  "scheduledFor": null,
  "createdAt": "2026-02-15T21:12:02.973Z"
}
```

**Workflow Statuts** :
1. `recu` → Soumission initiale
2. `en_lecture` → Admin en cours de lecture
3. `valide` → Validé, diffusable
4. `programme` → Programmé pour diffusion
5. `rejete` → Refusé (contenu inapproprié)

---

### `GET /api/v1/testimonies/public`

**Description** : Liste témoignages validés pour affichage public.

**Query Params** :
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 50)

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Titre",
      "contentText": "Extrait...",
      "mediaType": "image",
      "mediaUrl": "https://...",
      "createdAt": "2026-02-14T10:30:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 💰 Support & Donations

### `POST /api/v1/support/donations`

**Description** : Enregistrement don avec upload preuve de paiement.

**Content-Type** : `multipart/form-data`

**Body** :
```
donorName: Marie Kouassi
donorEmail: marie@example.com
donorPhone: +237670123456
amount: 25000
currency: XAF
transactionReference: MM20260215-1234
projectId: uuid-projet-optionnel
file: [screenshot preuve paiement, max 10MB]
```

**Réponse 201** :
```json
{
  "id": "uuid-transaction",
  "donorName": "Marie Kouassi",
  "donorEmail": "marie@example.com",
  "amount": "25000",
  "currency": "XAF",
  "transactionRefId": "MM20260215-1234",
  "proofScreenshotUrl": "https://.../transaction-proofs/uuid.png",
  "status": "en_attente",
  "projectId": "uuid-projet",
  "createdAt": "2026-02-15T22:00:00Z"
}
```

**Statuts Transaction** :
- `en_attente` → En attente validation comptable
- `verifie` → Validé par comptable
- `rejete` → Rejeté (preuve non conforme)

---

### `POST /api/v1/support/volunteers`

**Description** : Candidature bénévolat.

**Body** :
```json
{
  "fullName": "Paul Nguema",
  "email": "paul@example.com",
  "phone": "+237690123456",
  "skills": ["Vidéo", "Montage", "Gestion réseaux sociaux"],
  "availability": "Week-ends et soirées"
}
```

**Réponse 201** :
```json
{
  "id": "uuid",
  "fullName": "Paul Nguema",
  "email": "paul@example.com",
  "status": "actif",
  "createdAt": "2026-02-15T22:05:00Z"
}
```

---

### `POST /api/v1/support/partners`

**Description** : Proposition partenariat.

**Body** :
```json
{
  "name": "Entreprise SARL",
  "activityDomain": "Import-Export",
  "country": "Cameroun",
  "logoUrl": "https://...",
  "websiteUrl": "https://entreprise-sarl.cm"
}
```

---

## 📺 Programmes

### `GET /api/v1/programs`

**Description** : Catalogue programmes TV/Podcasts avec filtres.

**Query Params** :
- `category` (ProgramCategory: `info`, `jeunesse_cinema`, `podcast`, etc.)
- `format` (ContentFormat: `video`, `audio`, `ecrit`)
- `featured` (boolean)
- `page`, `limit`

**Exemple** : `GET /api/v1/programs?category=podcast&limit=5`

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Parole du Jour",
      "slug": "parole-du-jour",
      "category": "evangelisation",
      "format": "audio",
      "audioUrl": "https://...",
      "thumbnailUrl": "https://...",
      "publishedAt": "2026-02-15T06:00:00Z",
      "viewsCount": "5420"
    }
  ],
  "meta": {...}
}
```

---

### `GET /api/v1/programs/:slug`

**Description** : Détail programme + incrémentation vues.

**Exemple** : `GET /api/v1/programs/parole-du-jour`

**Réponse 200** :
```json
{
  "id": "uuid",
  "title": "Parole du Jour",
  "slug": "parole-du-jour",
  "description": "Méditation biblique quotidienne",
  "category": "evangelisation",
  "format": "audio",
  "audioUrl": "https://...",
  "contentText": "Transcription complète...",
  "viewsCount": "5421",
  "creator": {
    "fullName": "Pasteur Mbarga"
  }
}
```

---

## 🏗️ Projets

### `GET /api/v1/projects`

**Description** : Liste projets actifs avec calculs progressPercent.

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Orphelinat Espoir",
      "vision": "Accueillir 50 orphelins...",
      "goalAmount": "50000000",
      "currentAmount": "12500000",
      "progressPercent": 25,
      "milestones": [
        {
          "title": "Fondations",
          "isCompleted": true,
          "dueDate": "2026-01-31"
        },
        {
          "title": "Charpente",
          "isCompleted": false,
          "dueDate": "2026-03-15"
        }
      ]
    }
  ]
}
```

---

## 📚 Bibliothèque

### `GET /api/v1/library/books`

**Description** : Catalogue livres (gratuits et payants).

**Query Params** :
- `isFree` (boolean)
- `page`, `limit`

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Les Psaumes Expliqués",
      "author": "Dr. Emmanuel Titi",
      "description": "Analyse approfondie...",
      "price": "5000",
      "isFree": false,
      "coverUrl": "https://...",
      "downloadsCount": 342
    }
  ]
}
```

---

### `POST /api/v1/library/books/:id/purchase`

**Description** : Enregistrement achat livre (transaction Mobile Money).

**Body** :
```json
{
  "buyerName": "Sophie Atangana",
  "buyerEmail": "sophie@example.com",
  "buyerPhone": "+237670987654",
  "transactionReference": "MM20260215-5678",
  "proofScreenshotUrl": "https://..."
}
```

**Réponse 201** :
```json
{
  "id": "uuid-transaction",
  "transactionType": "achat_ouvrage",
  "amount": "5000",
  "status": "en_attente"
}
```

---

## 📢 Publicités

### `GET /api/v1/ads/active`

**Description** : Publicités actives pour affichage public.

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "clientName": "Entreprise XYZ",
      "mediaType": "image",
      "mediaUrl": "https://...",
      "redirectUrl": "https://xyz.com/promo",
      "startDate": "2026-02-01T00:00:00Z",
      "endDate": "2026-02-28T23:59:59Z",
      "viewsCount": 12340
    }
  ]
}
```

---

### `POST /api/v1/ads/:id/click`

**Description** : Incrémentation clics pub.

**Réponse 200** :
```json
{
  "success": true,
  "clicksCount": 456
}
```

---

## 📊 Admin - Dashboard

### `GET /api/v1/admin/dashboard`

**Auth** : Rôle `admin` minimum

**Description** : Analytics complètes et KPIs temps réel.

**Réponse 200** :
```json
{
  "finances": {
    "totalRevenue": "125000000",
    "monthlyRevenue": "8500000",
    "revenueByProject": [
      {
        "projectTitle": "Orphelinat Espoir",
        "amount": "12500000"
      }
    ]
  },
  "engagement": {
    "topPrograms": [
      {
        "title": "Témoignage du Dimanche",
        "viewsCount": "25340"
      }
    ],
    "programsByCategory": {
      "evangelisation": 12,
      "temoignage_live": 8,
      "podcast": 15
    }
  },
  "testimonies": {
    "totalReceived": 328,
    "pending": 12,
    "validated": 289,
    "rejected": 27
  },
  "transactions": {
    "totalPending": 5,
    "totalValidated": 245,
    "totalRejected": 8
  },
  "volunteers": {
    "totalActive": 45
  }
}
```

---

## ✅ Admin - Témoignages

### `GET /api/v1/admin/testimonies`

**Auth** : Rôle `admin` minimum

**Description** : Liste tous témoignages (tous statuts).

**Query Params** :
- `status` (TestimonyStatus: `recu`, `en_lecture`, `valide`, `rejete`, `programme`)
- `page`, `limit`

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "authorName": "Jean Dupont",
      "title": "Titre",
      "status": "recu",
      "mediaType": "video",
      "reviewedBy": null,
      "adminNotes": null,
      "createdAt": "2026-02-15T21:12:02Z"
    }
  ],
  "meta": {...}
}
```

---

### `PATCH /api/v1/admin/testimonies/:id`

**Auth** : Rôle `admin` minimum

**Description** : Modération témoignage (validation/rejet/programmation).

**Body** :
```json
{
  "status": "valide",
  "adminNotes": "Témoignage authentique et édifiant",
  "scheduledFor": "2026-02-20T18:00:00Z"
}
```

**Réponse 200** :
```json
{
  "id": "uuid",
  "status": "programme",
  "adminNotes": "Témoignage authentique et édifiant",
  "reviewedBy": "uuid-admin",
  "scheduledFor": "2026-02-20T18:00:00Z"
}
```

---

## 💳 Admin - Transactions

### `GET /api/v1/admin/transactions`

**Auth** : Rôle `accountant` minimum

**Description** : Liste transactions avec filtres.

**Query Params** :
- `status` (TransactionStatus)
- `transactionType` (SupportType)
- `page`, `limit`

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "donorName": "Marie Kouassi",
      "amount": "25000",
      "currency": "XAF",
      "transactionType": "don_financier",
      "status": "en_attente",
      "proofScreenshotUrl": "https://...",
      "createdAt": "2026-02-15T22:00:00Z"
    }
  ]
}
```

---

### `PATCH /api/v1/admin/transactions/:id/validate`

**Auth** : Rôle `accountant` minimum

**Description** : Validation/rejet transaction.

**Body** :
```json
{
  "status": "verifie"
}
```

**Réponse 200** :
```json
{
  "id": "uuid",
  "status": "verifie",
  "validatedBy": "uuid-comptable",
  "updatedAt": "2026-02-15T22:30:00Z"
}
```

---

## 🎬 Admin - Gestion de Contenu

### `POST /api/v1/admin/content/programs`

**Auth** : Rôle `manager` minimum

**Content-Type** : `multipart/form-data`

**Body** :
```
title: Nouvelle Émission
slug: nouvelle-emission
description: Description complète
category: evangelisation
format: video
videoUrl: https://youtube.com/watch?v=...
file: [miniature.jpg]
isFeatured: true
publishedAt: 2026-02-20T18:00:00Z
```

**Réponse 201** :
```json
{
  "id": "uuid",
  "title": "Nouvelle Émission",
  "slug": "nouvelle-emission",
  "thumbnailUrl": "https://.../public-assets/uuid.jpg"
}
```

---

### `POST /api/v1/admin/content/books`

**Auth** : Rôle `manager` minimum

**Content-Type** : `multipart/form-data`

**Body** :
```
title: Nouveau Livre
author: Dr. Jean Titi
description: Description
price: 5000
isFree: false
pdfFile: [livre.pdf]
coverFile: [couverture.jpg]
```

**Réponse 201** :
```json
{
  "id": "uuid",
  "title": "Nouveau Livre",
  "pdfUrl": "https://.../books-files/uuid.pdf",
  "coverUrl": "https://.../public-assets/uuid.jpg"
}
```

---

### `POST /api/v1/admin/content/ads`

**Auth** : Rôle `manager` minimum

**Content-Type** : `multipart/form-data`

**Body** :
```
clientName: Entreprise ABC
mediaType: image
redirectUrl: https://abc.com
startDate: 2026-03-01T00:00:00Z
endDate: 2026-03-31T23:59:59Z
file: [banniere-pub.jpg]
```

---

## ⚠️ Codes d'Erreur

| Code | Signification | Causes Fréquentes |
|------|--------------|-------------------|
| `400 Bad Request` | Données invalides | Champ manquant, format incorrect |
| `401 Unauthorized` | Non authentifié | Token manquant/expiré |
| `403 Forbidden` | Permissions insuffisantes | Rôle inadapté pour cette action |
| `404 Not Found` | Ressource introuvable | ID inexistant |
| `409 Conflict` | Conflit de données | Slug/email déjà utilisé |
| `413 Payload Too Large` | Fichier trop volumineux | Dépasse limite bucket |
| `415 Unsupported Media Type` | Format fichier non supporté | Type MIME non autorisé |
| `500 Internal Server Error` | Erreur serveur | Vérifier logs Render |

### Format Erreur Standard

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email format invalide"
    }
  ]
}
```

---

## 🚀 Déploiement & Variables d'Environnement

### Variables Requises (Render)

```bash
# Base de données
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

# Sécurité
JWT_SECRET=votre_secret_jwt_ultra_securise

# Supabase Storage
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optionnel
PORT=3000
NODE_ENV=production
```

### Commandes Déploiement

```bash
# Build
npm run build

# Migrations Prisma
npx prisma generate
npx prisma db push

# Démarrage
npm run start:prod
```

### Healthcheck

**Endpoint** : `GET /`

**Réponse** : `Backend Je Temoigne-TV v1.2.0 is running!`

---

## 🧪 Guide de Tests

### Avec Swagger UI

1. Accédez à `https://backend-jetemoigne-458j.onrender.com/api`
2. Authentifiez-vous via `POST /auth/login`
3. Cliquez sur **Authorize** (bouton vert en haut)
4. Collez le token : `Bearer eyJhbGciOi...`
5. Testez les endpoints protégés

### Avec Postman

1. Importez `JeTemoigne_V1.2.postman_collection.json`
2. Variable `{{base_url}}` = `https://backend-jetemoigne-458j.onrender.com/api/v1`
3. Auth tab → Bearer Token → collez token
4. Pour uploads : Body → form-data → type `File`

---

> [!IMPORTANT]
> **Ne jamais** commit les variables d'environnement sur Git. Utilisez exclusivement les variables Render pour la production.

> [!TIP]
> Pour tester en local : créez un `.env` à la racine avec les mêmes variables que Render.

---

**Documentation maintenue par l'équipe technique Je Temoigne-TV**  
*Dernière mise à jour : 16 Février 2026*
