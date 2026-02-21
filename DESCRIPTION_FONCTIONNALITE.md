# DESCRIPTION DES FONCTIONNALITÉS — Backend Je Témoigne TV

> Ce document décrit les fonctionnalités disponibles sur le backend et les inputs attendus par le frontend pour chaque action. Le préfixe de toutes les routes est **/api/v1**.

---

## 1. AUTHENTIFICATION (`/auth`)

### Connexion Admin
**Route :** `POST /api/v1/auth/login`

```json
{
  "email": "admin@jetemoigne.tv",
  "password": "MonMotDePasse123"
}
```
**Retour :** Token JWT à utiliser dans le header `Authorization: Bearer <token>` pour toutes les routes protégées.

---

### Profil connecté
**Route :** `GET /api/v1/auth/profile`
> Requiert un Bearer Token. Pas de body.

---

## 2. PAGE D'ACCUEIL & DONNÉES PUBLIQUES (`/public-hub`)

### Données agrégées (Accueil)
**Route :** `GET /api/v1/public-hub/home`
> Retourne programmes récents, actus, pubs actives, projets urgents, derniers témoignages. Pas de body.

### Statistiques globales d'impact
**Route :** `GET /api/v1/public-hub/stats`
> Nombre de donateurs, bénévoles, témoignages validés. Pas de body.

### Paramètres publics de l'application
**Route :** `GET /api/v1/public-hub/settings`
> Numéros Moov/Airtel, email de contact, règles de don. Pas de body.

---

## 3. PROGRAMMES (`/programs`)

### Lister les programmes
**Route :** `GET /api/v1/programs`

**Query params optionnels :**
| Paramètre | Type | Valeurs | Défaut |
|---|---|---|---|
| `page` | number | 1, 2, 3... | 1 |
| `limit` | number | 5, 10, 20... | 10 |
| `category` | string | `info`, `jeunesse_cinema`, `divertissement`, `podcast`, `evangelisation`, `concert`, `temoignage_live` | — |
| `format` | string | `video`, `audio`, `ecrit`, `image` | — |
| `search` | string | texte libre | — |

### Détails d'un programme
**Route :** `GET /api/v1/programs/:slug`
> Retourne les détails complets d'un programme via son slug.

### Programme en direct
**Route :** `GET /api/v1/programs/live`
> Retourne les informations du direct en cours (isLive=true).

### Incrémenter les vues
**Route :** `POST /api/v1/programs/:id/view`
> Pas de body. Appeler à chaque ouverture d'un programme.

---

## 4. TÉMOIGNAGES (`/testimonies`)

### Soumettre un témoignage (Public)
**Route :** `POST /api/v1/testimonies`
**Content-Type :** `multipart/form-data`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `authorName` | string | ✅ | Nom du témoignant |
| `authorEmail` | string | ❌ | Email (optionnel) |
| `title` | string | ❌ | Titre du témoignage |
| `contentText` | string | ❌ | Contenu texte |
| `mediaType` | string | ✅ | `video`, `audio`, `ecrit`, `image` |
| `file` | file (binary) | ❌ | Fichier vidéo, audio ou image |

### Lister les témoignages validés (Public)
**Route :** `GET /api/v1/testimonies`
> Query params : `page`, `limit`

---

## 5. PROJETS (`/projects`)

### Lister tous les projets
**Route :** `GET /api/v1/projects`
> Retourne la vision, les besoins et la progression de chaque projet. Pas de body.

### Détails d'un projet
**Route :** `GET /api/v1/projects/:id`

---

## 6. SOUTIEN — DONS (`/support`)

### Don manuel Mobile Money (avec preuve)
**Route :** `POST /api/v1/support/donations`
**Content-Type :** `multipart/form-data`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `donorName` | string | ✅ | Nom du donateur |
| `donorEmail` | string | ❌ | Email |
| `donorPhone` | string | ❌ | Numéro de téléphone |
| `amount` | number | ✅ | Montant en XAF |
| `currency` | string | ❌ | `XAF` par défaut |
| `transactionReference` | string | ❌ | Référence Mobile Money |
| `projectId` | string (UUID) | ❌ | ID du projet ciblé |
| `file` | file (binary) | ❌ | Photo de la preuve de paiement |

**Retour :** Transaction avec `status: en_attente`. À valider manuellement par un admin.

---

### Don automatique Notch Pay (Lien de paiement)
**Route :** `POST /api/v1/support/donations/initiate`
**Content-Type :** `application/json`

```json
{
  "donorName": "Jean Gabin",
  "donorEmail": "jean@example.com",
  "donorPhone": "+24106000000",
  "amount": 5000,
  "currency": "XAF",
  "projectId": "UUID-du-projet-optionnel"
}
```

**Retour en cas de succès :**
```json
{
  "id": "UUID-de-la-transaction",
  "payment_url": "https://pay.notchpay.co/pay/...",
  "reference": "NOTCH-REF-..."
}
```
> Rediriger le donateur vers `payment_url`. Notch Pay notifie le backend via webhook à la fin.

---

### Candidature Bénévole
**Route :** `POST /api/v1/support/volunteer`

```json
{
  "fullName": "Paul Mba",
  "email": "paul@example.com",
  "phone": "+24107000000",
  "skills": ["Vidéo", "Montage", "Communication"],
  "availability": "Week-ends et soirées"
}
```

---

### Proposition de Partenariat
**Route :** `POST /api/v1/support/partner`

```json
{
  "name": "Société XYZ",
  "activityDomain": "Médias & Communication",
  "country": "Gabon",
  "logoUrl": "https://...",
  "websiteUrl": "https://xyz.com"
}
```

---

## 7. BIBLIOTHÈQUE / OUVRAGES (`/library`)

### Lister les ouvrages
**Route :** `GET /api/v1/library/books`
> Query params : `page`, `limit`

**Champs clés retournés par ouvrage :**
| Champ | Description |
|---|---|
| `id` | UUID de l'ouvrage |
| `title` | Titre |
| `author` | Auteur |
| `description` | Description |
| `price` | Prix en XAF (0 si gratuit) |
| `isFree` | `true` = téléchargement direct sans paiement |
| `pdfUrl` | URL directe du PDF |
| `coverUrl` | URL de la couverture |
| `downloadsCount` | Nombre de téléchargements |

### Détails d'un ouvrage
**Route :** `GET /api/v1/library/books/:id`

### Enregistrer un téléchargement (Livre gratuit)
**Route :** `POST /api/v1/library/books/:id/download`
> Pas de body. À appeler lorsque l'utilisateur télécharge un livre `isFree: true`.

### Acheter un ouvrage via Notch Pay
**Route :** `POST /api/v1/library/books/:id/purchase`

```json
{
  "buyerName": "Jean Gabin",
  "buyerEmail": "jean@example.com",
  "buyerPhone": "+24106000000",
  "currency": "XAF",
  "callbackUrl": "https://votre-site.com/library/success"
}
```

**Retour si livre gratuit (`isFree: true`) :**
```json
{
  "isFree": true,
  "pdfUrl": "https://storage.supabase.co/...",
  "message": "Ouvrage gratuit. Téléchargement disponible."
}
```

**Retour si livre payant :**
```json
{
  "isFree": false,
  "transactionId": "UUID-transaction",
  "payment_url": "https://pay.notchpay.co/pay/...",
  "reference": "NOTCH-REF-...",
  "book": {
    "id": "UUID",
    "title": "La Parole qui Libère",
    "price": 3000,
    "currency": "XAF"
  }
}
```

**Logique frontend recommandée :**
1. Récupérer le livre → Vérifier `isFree`
2. Si `isFree: true` → Bouton "Télécharger" → `POST /download` → Ouvrir `pdfUrl`
3. Si `isFree: false` → Bouton "Acheter" → `POST /purchase` → Rediriger vers `payment_url`

---

## 8. PUBLICITÉS — RÉSERVATION (`/ads`)

### Voir les publicités actives
**Route :** `GET /api/v1/ads/active`
> Retourne les publicités en diffusion actuellement.

### Enregistrer un clic
**Route :** `POST /api/v1/ads/:id/click`
> Pas de body. Appeler à chaque clic sur une pub.

### Enregistrer une vue (impression)
**Route :** `POST /api/v1/ads/:id/view`
> Pas de body. Appeler à chaque affichage d'une pub.

### Formats et tarifs disponibles
**Route :** `GET /api/v1/ads/formats`

**Retour exemple :**
```json
[
  {
    "format": "banner_top",
    "label": "Bannière Haute (Header)",
    "dailyRate": 5000,
    "currency": "XAF",
    "description": "Bannière pleine largeur en haut de chaque page.",
    "example": "Pour 7 jours : 35000 XAF"
  },
  {
    "format": "sidebar",
    "label": "Colonne Latérale (Sidebar)",
    "dailyRate": 2500,
    "currency": "XAF",
    "description": "Bloc publicitaire dans la colonne de droite.",
    "example": "Pour 7 jours : 17500 XAF"
  }
]
```

### Réserver une publicité via Notch Pay
**Route :** `POST /api/v1/ads/book`

> Le prix est calculé **automatiquement** : `tarif_journalier × nombre_de_jours`.

```json
{
  "clientName": "Airtel Gabon",
  "clientEmail": "marketing@airtel.ga",
  "clientPhone": "+24174000000",
  "clientCompany": "Airtel Gabon SA",
  "format": "banner_top",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-03-31T23:59:59Z",
  "redirectUrl": "https://airtel.ga/offre",
  "mediaUrl": "https://storage.supabase.co/...",
  "currency": "XAF"
}
```

**Formats disponibles :**
| Format | Tarif/jour | Description |
|---|---|---|
| `banner_top` | 5 000 XAF | Bannière haute de page |
| `banner_bottom` | 3 000 XAF | Bannière basse de page |
| `sidebar` | 2 500 XAF | Colonne latérale |
| `interstitial` | 8 000 XAF | Publicité plein écran (avant vidéo) |

**Retour :**
```json
{
  "transactionId": "UUID-transaction",
  "payment_url": "https://pay.notchpay.co/pay/...",
  "reference": "NOTCH-REF-...",
  "summary": {
    "format": "banner_top",
    "formatLabel": "Bannière Haute (Header)",
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-03-31T23:59:59Z",
    "durationDays": 31,
    "dailyRate": 5000,
    "totalPrice": 155000,
    "currency": "XAF"
  }
}
```

---

## 9. UPLOAD DE FICHIERS (`/storage`)

**Route :** `POST /api/v1/storage/upload`
**Requiert un Bearer Token.**
**Content-Type :** `multipart/form-data`

| Champ | Type | Description |
|---|---|---|
| `file` | file (binary) | Fichier à uploader |
| `bucket` | string (query) | Bucket Supabase : `public-assets`, `testimonies-media`, `transaction-proofs`, `books-files` |

**Retour :**
```json
{ "url": "https://supabase.co/storage/v1/object/public/..." }
```

---

## 10. PAIEMENTS — WEBHOOK (`/payments`)

### Initialiser un paiement direct
**Route :** `POST /api/v1/payments/initiate`

```json
{
  "amount": 5000,
  "currency": "XAF",
  "email": "donateur@exemple.com",
  "description": "Don Je Témoigne TV",
  "callback_url": "https://votre-site.com/merci"
}
```

### Webhook Notch Pay (Interne — ne pas appeler manuellement)
**Route :** `POST /api/v1/payments/webhook`
> Appelé automatiquement par Notch Pay. Vérifie la signature HMAC et traite les événements `payment.complete`.

---

## 11. ADMINISTRATION (Routes protégées — JWT + Rôle requis)

> Ajouter dans les headers : `Authorization: Bearer <token>`

### Tableau de bord
**Route :** `GET /api/v1/admin/hub/dashboard`
> Rôles : `admin`, `super_admin`, `manager`

### Gérer les paramètres
**Route :** `PATCH /api/v1/admin/hub/settings`
> Rôle : `super_admin`

```json
{
  "airtelMoneyNumber": "+24174000000",
  "moovMoneyNumber": "+24166000000",
  "contactEmail": "contact@jetemoigne.tv",
  "donationRules": "Don minimum : 1000 XAF",
  "siteName": "Je Témoigne TV"
}
```

### Valider une transaction
**Route :** `PATCH /api/v1/admin/finances/transactions/:id/validate`
> Rôles : `admin`, `super_admin`, `accountant`. Pas de body.

### Rejeter une transaction
**Route :** `PATCH /api/v1/admin/finances/transactions/:id/reject`
> Pas de body.

### Changer le rôle d'un collaborateur
**Route :** `PATCH /api/v1/admin/team/users/:id/role`
> Rôle : `super_admin`

```json
{ "role": "manager" }
```
**Rôles disponibles :** `admin`, `super_admin`, `manager`, `accountant`, `observer`

### Valider un témoignage
**Route :** `PATCH /api/v1/admin/testimonies/:id/validate`

```json
{
  "contentText": "Texte corrigé du témoignage (optionnel)",
  "adminNotes": "Notes internes du modérateur"
}
```

### Planifier un témoignage
**Route :** `PATCH /api/v1/admin/testimonies/:id/schedule`

```json
{ "scheduledFor": "2026-03-01T19:00:00.000Z" }
```

### Créer un programme (Admin)
**Route :** `POST /api/v1/admin/content/programs`
**Content-Type :** `multipart/form-data`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `title` | string | ✅ | Titre du programme |
| `category` | string | ✅ | `info`, `jeunesse_cinema`, `divertissement`, `podcast`, `evangelisation`, `concert`, `temoignage_live` |
| `format` | string | ✅ | `video`, `audio`, `ecrit`, `image` |
| `description` | string | ❌ | Description |
| `duration` | number | ❌ | Durée en minutes |
| `thumbnail` | file | ❌ | Image miniature |
| `media` | file | ❌ | Fichier vidéo/audio/image principal |

### Créer une publicité (Admin)
**Route :** `POST /api/v1/admin/content/ads`
**Content-Type :** `multipart/form-data`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `title` | string | ✅ | Nom du client/annonceur |
| `redirectUrl` | string | ✅ | URL de clic |
| `position` | string | ❌ | `banner_top`, `banner_bottom`, `sidebar`, `interstitial` |
| `startDate` | date | ❌ | Date de début |
| `endDate` | date | ❌ | Date de fin |
| `file` | file | ❌ | Image bannière |

### Ajouter un ouvrage (Admin)
**Route :** `POST /api/v1/admin/content/books`
**Content-Type :** `multipart/form-data`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `title` | string | ✅ | Titre de l'ouvrage |
| `author` | string | ✅ | Auteur |
| `description` | string | ❌ | Description |
| `price` | number | ❌ | Prix en XAF (0 = gratuit) |
| `currency` | string | ❌ | `XAF` par défaut |
| `pdf` | file | ❌ | Fichier PDF de l'ouvrage |
| `cover` | file | ❌ | Image de couverture |

---

## FLUX DE PAIEMENT NOTCH PAY (Résumé)

```
Frontend → POST /...initiate ou /purchase ou /ads/book
            ↓ 
        Réponse : payment_url
            ↓
        Redirection vers Notch Pay
            ↓
        Notchpay → webhook → POST /api/v1/payments/webhook
            ↓
        Backend : transaction.status = "verifie"
            ↓
        Frontend : Vérifier /public-hub/home ou interroger la transaction
```

---

## VARIABLES D'ENVIRONNEMENT REQUISES

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion Prisma (Supabase) |
| `DIRECT_URL` | URL directe Supabase (migrations) |
| `JWT_SECRET` | Secret pour les tokens JWT |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_KEY` | Clé service Supabase (Storage) |
| `NOTCH_PAY_PUBLIC_KEY` | Clé publique Notch Pay |
| `NOTCH_PAY_SECRET_KEY` | Clé secrète Notch Pay |
| `NOTCH_PAY_WEBHOOK_SECRET` | Secret pour vérifier les webhooks |
| `FRONTEND_URL` | URL du frontend (ex: https://jetemoigne.tv) |
