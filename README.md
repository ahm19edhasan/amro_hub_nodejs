# amro_hub API

A RESTful backend for managing a study/co‑working hub: clients, hourly sessions,
members (users), subscription plans, and admin settings. Built with **Express 5**,
**TypeScript**, **Prisma 7**, and **PostgreSQL**, with JWT‑based admin authentication
(access + refresh tokens delivered via HTTP‑only cookies).

## Features

- **Admin authentication** : login, `/me`, refresh, and logout with short‑lived
  access tokens and rotating refresh tokens (hashed and stored in the database).
- **Users** : member records with balance, university affiliation, and soft delete.
- **Clients & Sessions** : check‑in / check‑out flow with automatic duration,
  hourly rate, free hours, and total‑cost calculation.
- **Plans & Subscriptions** : subscription plans with pricing/discounts and
  active/expired lifecycle.
- **Settings** : key/value app configuration (e.g. default `hourly_rate`, `free_hours`).
- **Production‑ready middleware** : Helmet, CORS, rate limiting, gzip compression,
  request validation (Zod), centralized error handling, and i18n support.

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Runtime    | Node.js                                   |
| Language   | TypeScript (ES2022, NodeNext)             |
| Framework  | Express 5                                 |
| ORM        | Prisma 7 (`@prisma/adapter-pg`)           |
| Database   | PostgreSQL                                |
| Auth       | JWT (`jsonwebtoken`), `bcryptjs`, cookies |
| Validation | Zod                                       |
| Logging    | Winston + Morgan                          |
| i18n       | i18next                                   |
| Testing    | Vitest + Supertest                        |
| Tooling    | ESLint, Prettier, tsx                     |

## Project Structure

```
src/
├── app.ts                # Express app + global middleware
├── server.ts             # HTTP server bootstrap + graceful shutdown
├── config/               # env (Zod-validated) & Prisma client
├── lib/                  # helpers: jwt, password, tokens, apiResponse, pagination…
├── middlewares/          # authenticate, requireAdmin, validate, errorHandler…
├── modules/              # feature modules (controller / service / routes / schema / serializer)
│   ├── auth/
│   ├── users/
│   ├── clients/
│   ├── sessions/
│   ├── plans/
│   ├── subscriptions/
│   └── settings/
├── routes/index.ts       # mounts all module routers under /api
└── types/                # Express type augmentation
prisma/
├── schema.prisma         # data model
├── migrations/           # SQL migrations
└── seed.ts               # seeds the default admin + settings
```

## Getting Started

### Prerequisites

- Node.js (LTS) and npm
- A running PostgreSQL instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# App
NODE_ENV=development
PORT=5004

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/amro_hub?schema=public"

# JWT (each secret must be at least 32 characters)
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
JWT_REFRESH_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info

# CORS : comma-separated list of allowed origins
CLIENT_ORIGIN=http://localhost:5173
```

Environment variables are validated at startup; the server exits with a clear
message if anything is missing or invalid.

### 3. Set up the database

```bash
npm run prisma:generate   # generate the Prisma client
npm run prisma:migrate    # apply migrations (dev)
npm run db:seed           # seed default admin + settings
```

The seed creates a default admin (override via `SEED_ADMIN_*` env vars):

```
email:    admin@amrohub.com
password: Admin@12345
```

> ⚠️ Change this password after first login.

### 4. Run

```bash
npm run dev      # development with hot reload (tsx watch)
# or
npm run build    # prisma generate + tsc → dist/
npm start        # run the compiled server
```

The API is served at `http://localhost:5004`, with a health check at `GET /health`.

## API Overview

All feature routes are mounted under `/api`. Every route except auth requires an
authenticated admin (access token cookie + `requireAdmin`).

### Auth => `/api/auth`

| Method | Path       | Description                     | Auth |
| ------ | ---------- | ------------------------------- | ---- |
| POST   | `/login`   | Admin login, sets token cookies | ❌   |
| GET    | `/me`      | Current authenticated admin     | ✅   |
| POST   | `/refresh` | Rotate the refresh token        | ❌   |
| POST   | `/logout`  | Revoke session & clear cookies  | ❌   |

### Users => `/api/users`

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/`                  | List users          |
| GET    | `/:id`               | Get a user          |
| POST   | `/`                  | Create a user       |
| PUT    | `/:id`               | Update a user       |
| DELETE | `/:id`               | Delete a user       |
| PATCH  | `/:id/change-status` | Activate/deactivate |

### Clients => `/api/clients`

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/`                  | List clients        |
| GET    | `/:id`               | Get a client        |
| POST   | `/`                  | Create a client     |
| PUT    | `/:id`               | Update a client     |
| PATCH  | `/:id/change-status` | Activate/deactivate |
| DELETE | `/:id`               | Delete a client     |

### Sessions => `/api/sessions`

| Method | Path       | Description                         |
| ------ | ---------- | ----------------------------------- |
| GET    | `/`        | List sessions                       |
| GET    | `/:id`     | Get a session                       |
| POST   | `/`        | Start a session (check‑in)          |
| PATCH  | `/:id/end` | End a session (check‑out + billing) |
| DELETE | `/:id`     | Delete a session                    |

### Plans => `/api/plans`

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/`                  | List plans          |
| GET    | `/:id`               | Get a plan          |
| POST   | `/`                  | Create a plan       |
| PUT    | `/:id`               | Update a plan       |
| DELETE | `/:id`               | Delete a plan       |
| PUT    | `/:id/change-status` | Activate/deactivate |

### Subscriptions => `/api/subscriptions`

| Method | Path          | Description           |
| ------ | ------------- | --------------------- |
| GET    | `/`           | List subscriptions    |
| GET    | `/:id`        | Get a subscription    |
| POST   | `/`           | Create a subscription |
| PUT    | `/:id`        | Update a subscription |
| PATCH  | `/:id/expire` | Mark as expired       |
| DELETE | `/:id`        | Delete a subscription |

### Settings => `/api/settings`

| Method | Path    | Description          |
| ------ | ------- | -------------------- |
| GET    | `/`     | List all settings    |
| GET    | `/:key` | Get a setting by key |
| PUT    | `/:key` | Update a setting     |

## Data Model

PostgreSQL via Prisma. Core models: `Admin`, `RefreshToken`, `User`,
`Plan`, `Subscription`, `Client`, `Session`, and `Settings`. Most records use
UUID primary keys, `snake_case` column mapping, timestamps, and a `deletedAt`
soft‑delete column. See [`prisma/schema.prisma`](prisma/schema.prisma) for the
full schema.

## Scripts

| Script                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Start dev server with hot reload            |
| `npm run build`          | Generate Prisma client + compile TypeScript |
| `npm start`              | Run the compiled server (`dist/server.js`)  |
| `npm run typecheck`      | Type-check without emitting                 |
| `npm run lint`           | Run ESLint                                  |
| `npm run lint:fix`       | Fix lint issues                             |
| `npm run format`         | Format with Prettier                        |
| `npm test`               | Run tests once (Vitest)                     |
| `npm run test:watch`     | Run tests in watch mode                     |
| `npm run prisma:migrate` | Create & apply a dev migration              |
| `npm run prisma:deploy`  | Apply migrations (production)               |
| `npm run prisma:studio`  | Open Prisma Studio                          |
| `npm run prisma:reset`   | Reset the database                          |
| `npm run db:seed`        | Seed admin + default settings               |

## License

ISC
