<div align="center">
  <a href="./README.en.md"><img src="https://img.shields.io/badge/English-README-1f6feb?style=for-the-badge" alt="English README"></a>
  <a href="./README.fr.md"><img src="https://img.shields.io/badge/Français-README-2563eb?style=for-the-badge" alt="README français"></a>
</div>

# ⚡ Node/Express Starter Template

Une base prête à l'emploi pour éviter de recommencer la configuration d'un
projet Express depuis zéro.

Le projet utilise Express, PostgreSQL, Prisma 7 et une gestion des traductions
en anglais et en arabe.

## 🚀 Utilisation rapide

### Après le clone du projet

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement local
cp .env.example .env
# Puis renseigner DATABASE_URL dans .env

# 3. Générer le client Prisma et appliquer la migration initiale
npm run db:setup

# 4. Démarrer le serveur en mode développement
npm run server
```

Si des migrations existent déjà dans `prisma/migrations/`, `db:setup` génère
le client Prisma et applique les migrations manquantes à la base de données.

Les migrations doivent être versionnées dans Git. Le dossier
`prisma/generated/`, lui, est généré localement et ne doit pas être commité.

## 🧬 Après une modification du schéma Prisma

Après avoir modifié `prisma/schema.prisma` :

```bash
# Créer et appliquer une migration
npm run db:migrate -- --name description_du_changement

# Régénérer le client Prisma
npm run db:generate
```

Exemple :

```bash
# Ajouter une date de publication aux posts
npm run db:migrate -- --name add_post_published_at

# Mettre à jour le client Prisma utilisé par l'application
npm run db:generate
```

Après cette modification, il faut commiter :

- `prisma/schema.prisma` ;
- le nouveau dossier créé dans `prisma/migrations/`.

Ne commite pas `prisma/generated/`.

## 📜 Scripts disponibles

Les scripts sont définis dans `package.json`. Comme le format JSON n'autorise
pas les commentaires, leur rôle est expliqué ici :

```bash
# Générer le client Prisma dans prisma/generated/
npm run db:generate

# Créer et appliquer une migration en développement
npm run db:migrate -- --name nom_de_la_migration

# Appliquer uniquement les migrations existantes en production
npm run db:migrate:deploy

# Vérifier l'état des migrations
npm run db:status

# Ouvrir Prisma Studio
npm run db:studio

# Effectuer la configuration initiale : génération + migration init
npm run db:setup

# Démarrer le serveur avec rechargement automatique
npm run server

# Démarrer le serveur en mode production
npm start
```

## 🧱 Stack technique

| Technologie | Rôle |
|---|---|
| `express` | Framework HTTP |
| `cors` | Autoriser le client frontend |
| `helmet` | Sécuriser les en-têtes HTTP |
| `express-rate-limit` | Limiter les requêtes par adresse IP |
| `dotenv` | Charger les variables d'environnement |
| `@prisma/client` | Client ORM Prisma |
| `@prisma/adapter-pg` | Adaptateur PostgreSQL requis par Prisma 7 |
| `i18next` | Gestion des traductions |

## 🗂️ Structure du projet

```text
.
├── config/              # Configuration de la base et des traductions
├── controllers/         # Logique métier des routes
├── errors/              # Erreurs applicatives personnalisées
├── locales/             # Traductions anglaises et arabes
├── middlewares/         # Middlewares Express
├── prisma/
│   ├── migrations/      # Migrations versionnées dans Git
│   └── schema.prisma    # Schéma de la base de données
├── routes/              # Routes HTTP
├── prisma.config.js     # Configuration Prisma 7
└── server.js            # Point d'entrée du serveur
```

## ✅ Prérequis

- Node.js `>= 20.19` ;
- npm `>= 10` ;
- une base de données PostgreSQL ;
- l'URL de connexion PostgreSQL.

Vérifier les versions installées :

```bash
node --version
npm --version
```

## 🔐 Variables d'environnement

Créer `.env` à partir de `.env.example` :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/dbname?sslmode=require"
PORT="3001"
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

Le fichier `.env` contient des informations sensibles et ne doit jamais être
commité.

Avec Prisma 7, `DATABASE_URL` se trouve dans `prisma.config.js` et non plus
directement dans le bloc `datasource` de `schema.prisma`.

## 🗃️ Prisma et migrations

### Première initialisation

La commande suivante génère le client Prisma et crée/applique la migration
initiale :

```bash
npm run db:setup
```

### Modification du schéma

Après chaque modification de `prisma/schema.prisma`, créer une migration avec
un nom explicite :

```bash
npm run db:migrate -- --name add_new_field
npm run db:generate
```

### Production

En production, ne pas utiliser `migrate dev`. Utiliser uniquement les
migrations déjà versionnées :

```bash
npm run db:generate
npm run db:migrate:deploy
npm start
```

`db:migrate:deploy` n'effectue aucune modification du schéma et ne crée pas de
nouvelle migration ; il applique seulement les migrations existantes.

## 🌐 Internationalisation

Les langues disponibles sont :

- anglais : `en` ;
- arabe : `ar`.

La langue peut être détectée avec l'en-tête `Accept-Language` ou avec le
paramètre `?lang=ar`. Les messages sont définis dans `locales/en.json` et
`locales/ar.json`.

## 🔌 Routes actuelles

```text
GET /                         # Route de test
GET /api/auth/register        # Exemple d'inscription
GET /api/auth/login           # Exemple de connexion
```

Les routes d'authentification sont actuellement des exemples de départ. Elles
devront être complétées avec la validation des données, le hashage des mots de
passe et un mécanisme de session ou de token.

## 🧪 Vérification rapide

```bash
curl http://localhost:3001/
curl http://localhost:3001/api/auth/register
npm run db:status
npm run db:studio
```

## ⚠️ Points importants

- Ne jamais commiter `.env`.
- Commiter `prisma/migrations/`.
- Ne pas commiter `prisma/generated/`.
- Utiliser `migrate dev` en développement et `migrate deploy` en production.
- Exécuter `db:generate` après chaque modification du schéma Prisma.
