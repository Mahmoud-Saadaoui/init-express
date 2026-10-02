<div align="center">
  <a href="./README.en.md"><img src="https://img.shields.io/badge/English-README-1f6feb?style=for-the-badge" alt="English README"></a>
  <a href="./README.fr.md"><img src="https://img.shields.io/badge/Français-README-2563eb?style=for-the-badge" alt="README français"></a>
</div>

## ⚡ Node/Express Starter Template

A ready-to-use Express starter template to save time and avoid repetitive setup steps.

No more initializing npm, installing express, or configuring the project from scratch — just download, install, and start coding.

✅ Ready in minutes

---

## 🚀 Quick start

This project is a reusable base for quickly starting new Express projects with
PostgreSQL and Prisma.

### After cloning the project

```bash
# 1. Install dependencies
npm install

# 2. Create the local environment file
cp .env.example .env
# Then set DATABASE_URL in the .env file

# 3. Generate the Prisma client and apply the initial migration
npm run db:setup

# 4. Start the development server
npm run server
```

If migrations already exist in `prisma/migrations/`, `db:setup` generates the
Prisma client and applies the missing migrations to the database. Migrations
must be committed to Git, unlike `prisma/generated/`, which is generated
locally.

### After changing the Prisma schema

After modifying `prisma/schema.prisma`:

```bash
# Create and apply a migration
npm run db:migrate -- --name change_description

# Regenerate the Prisma client
npm run db:generate
```

Example:

```bash
# Add a publication date to posts
npm run db:migrate -- --name add_post_published_at

# Update the Prisma client used by the application
npm run db:generate
```

### Available scripts

The scripts are defined in `package.json`. Since JSON does not allow comments
directly before each property, their purpose is documented here:

```bash
# Generate the Prisma client in prisma/generated/
npm run db:generate

# Create and apply a migration in development
npm run db:migrate -- --name migration_name

# Apply existing migrations only in production
npm run db:migrate:deploy

# Check migration status
npm run db:status

# Open Prisma Studio
npm run db:studio

# Run initial setup: generation + init migration
npm run db:setup

# Start the server with automatic reload
npm run server

# Start the server in production mode
npm start
```

For deployment, use `npm run db:migrate:deploy` instead of `npm run
db:migrate`.

---

# Prisma 7 Setup Guide

This guide explains how to install, configure, and run the server with **Prisma 7** and a **PostgreSQL** database (e.g. Neon).

## Prerequisites

- Node.js ≥ 20.19 (required by Prisma 7). Check with `node --version`
- npm ≥ 10. Check with `npm --version`
- A PostgreSQL database with its connection URL

## 1. Install dependencies

Runtime dependencies:

```bash
npm install @prisma/client @prisma/adapter-pg
```

| Package | Role |
|---|---|
| `express` | HTTP framework |
| `cors` | Allow the React client (port 3000) |
| `helmet` | Secure HTTP headers |
| `express-rate-limit` | Rate limiting per IP |
| `dotenv` | Load `.env` into `process.env` |
| `@prisma/client` | Prisma client |
| `@prisma/adapter-pg` | PostgreSQL driver adapter (**required** in Prisma 7) |

Dev dependency (CLI tool only):

```bash
npm install --save-dev prisma
```

> In Prisma 7, `@prisma/adapter-pg` is **mandatory**: you can no longer call
> `new PrismaClient()` without a driver adapter. The connection URL is passed to
> the driver at the application level.

If the install is interrupted, delete `node_modules/` and `package-lock.json`,
then reinstall — a partially corrupted `node_modules` causes `tarball data ... seems to be corrupted` errors.

## 2. Create the `prisma/` directory and schema

Option A — official command:

```bash
npx prisma init --datasource-provider postgresql
```

Option B — manual setup (as done here):

```bash
mkdir prisma
```

Then create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)

  authorId  Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Important notes for Prisma 7:

- The database URL is **no longer** in the `datasource` block (it lives in `prisma.config.js`).
- With `generator = "prisma-client-js"` and an `output`, the client is generated into `./generated/prisma` and imported with `import { PrismaClient } from "./prisma/generated/prisma/client.js"`.

## 3. Create `prisma.config.js`

> The file **must** be named `prisma.config.js` (or `.ts`/`.mjs`/`.cjs`). A versioned
> name like `prisma7.config.js` will not be detected.

```js
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL")
  },
});
```

This file lets the Prisma CLI (`prisma generate`, `migrate`, `studio`...) locate the schema and the database. Without it, Prisma 7 shows "Could not find Prisma Schema...".

Gotchas:

- `env(...)` must be imported from `prisma/config` (`import { defineConfig, env }`), otherwise you get `ReferenceError: env is not defined`.
- `import "dotenv/config";` is required because **Prisma 7 no longer loads `.env` automatically**.

## 4. Environment variables

`.env.example` (template to commit):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/dbname?sslmode=require"
PORT="3001"
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

`.env` (real values, **do not commit** — already in `.gitignore`): set your actual `DATABASE_URL`.

## 5. Wire the database into the app: `config/db.js`

A single file that instantiates `PrismaClient` with the `PrismaPg` driver adapter and checks the connection at startup:

```js
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function checkDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

checkDbConnection();

export default prisma;
```

Import it in controllers with the **default** import:

```js
import prisma from "../config/db.js";

const user = await prisma.user.create({ ... });   // ✅
```

## 6. Prisma scripts

Prisma commands are available through the project's npm scripts:

| Command | Purpose |
|---|---|
| `npm run db:generate` | Generates the Prisma client in `prisma/generated/` |
| `npm run db:migrate` | Creates and applies a migration in development |
| `npm run db:migrate:deploy` | Applies existing migrations in production |
| `npm run db:status` | Displays migration status |
| `npm run db:studio` | Opens Prisma Studio |
| `npm run db:setup` | Generates the client and creates/applies the initial `init` migration |

Additional arguments are passed after `--`:

```bash
npm run db:migrate -- --name add_profile
```

## 7. Workflow after cloning

### 1. Install the project

```bash
git clone <url-du-projet>
cd <nom-du-projet>
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Then set the real values in `.env`, especially `DATABASE_URL`.
The `.env` file must never be committed.

### 3. Initialize Prisma

If the project does not have an initial migration yet:

```bash
npm run db:setup
```

This command runs `prisma generate`, then creates and applies the `init`
migration.

If the project already contains versioned migrations in
`prisma/migrations/`, the same command generates the client and applies the
missing migrations to the local database.

### 4. Start the server

```bash
npm run server
```

Expected output:

```
✅ Database connected successfully
Server is running on port 3001
```

Quick tests:

```bash
curl http://localhost:3001/                  # → {"message":"Hello World!"}
curl http://localhost:3001/api/auth/register # creates a user (201)
```

## 8. Workflow after a schema change

After modifying `prisma/schema.prisma`:

### 1. Create and apply a migration

```bash
npm run db:migrate -- --name change_description
```

Example:

```bash
npm run db:migrate -- --name add_post_published_at
```

This command creates a new directory in `prisma/migrations/` and applies the
migration to the development database.

### 2. Regenerate the Prisma client

```bash
npm run db:generate
```

This updates the Prisma types and methods available in the code. With Prisma 7,
it must be run explicitly after every schema change.

### 3. Commit the required files

Commit:

- `prisma/schema.prisma`
- le nouveau dossier dans `prisma/migrations/`

Do not commit `prisma/generated/`, because it is regenerated locally.

To inspect the data:

```bash
npm run db:studio
```

## 9. Deployment

In production, do not use `migrate dev`. After installing dependencies and
configuring `DATABASE_URL`, use:

```bash
npm run db:generate
npm run db:migrate:deploy
npm start
```

`db:migrate:deploy` only applies committed migrations and does not create a new
migration.

## 10. Common pitfalls

| Pitfall | Solution |
|---|---|
| `env is not defined` in `prisma.config` | import `env` from `prisma/config` |
| file named `prisma7.config.js` | rename it to `prisma.config.js` |
| Prisma 7 does not load `.env` | add `import "dotenv/config";` in the config and the code |
| `import cors` crashes | run `npm install cors` |
| `app.listen(PORT)` before `const PORT` | declare `PORT` before using it |
| default import of prisma is `undefined` | use `import prisma from "../config/db.js"` |
| `new PrismaClient()` without adapter | use `@prisma/adapter-pg` in Prisma 7 |
| partially corrupted `node_modules` | `rm -rf node_modules package-lock.json && npm install` |
| `migrate dev` proposes a reset | reconcile the history via `migrate resolve --applied` |
