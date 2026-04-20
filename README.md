# Farmer Market Platform

A Vite + React + TypeScript application for farmer support, crop selling, scheme discovery, market intelligence, and admin management.

## Features

- Farmer registration and profile management
- Schemes and loan information with direct external application links
- Market access for crop listings and buyer contact flows
- Live market price and intelligence dashboard
- Bill generation and PDF download
- Admin login and protected admin panel
- Multilingual interface support

## Tech Stack

- React
- TypeScript
- Vite
- Express

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Deploy To Vercel

```bash
vercel
```

Vercel is configured to:

- build the frontend into `dist`
- serve API routes through `api/[...path].js`

## Hosted Database

This app now supports a hosted Postgres database through `DATABASE_URL`.

Local development:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to a Neon or other Postgres connection string, then run:

```bash
npm run dev
```

If `DATABASE_URL` is not set, the app falls back to `server/data/db.json` for local development only.

For Vercel production:

1. Create a Postgres database. Vercel's current Postgres guidance is to add a Marketplace Postgres provider such as Neon, because Vercel Postgres itself is no longer offered for new projects.
2. Add the provider's connection string as `DATABASE_URL` in your Vercel project environment variables.
3. Redeploy the project.

If `DATABASE_URL` is missing on Vercel, registration, login upgrades, order creation, and listing changes will fail because Vercel serverless functions cannot safely persist updates to the local JSON file.

On first connection, the app seeds the hosted database from the current local JSON data if the hosted tables are empty.
