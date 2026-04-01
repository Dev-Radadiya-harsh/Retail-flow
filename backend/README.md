# RetailFlow backend (API)

This folder is the **only** place for server-side code: Express routes, JWT auth, and the SQLite database file under `db/`.

## Run locally

From the **repository root** (parent of `backend/`):

```bash
npm run backend:dev
```

Or from any directory:

```bash
cd backend && node index.js
```

Default API URL: `http://localhost:3001` (see `index.js` and optional `backend/.env`).

## Install dependencies

```bash
cd backend && npm install
```

## Database

- File: `db/retailflow.db` (created automatically)
- Schema + seed: `db/database.js`, `db/seed.js`

Do not import this folder from the React app; the frontend talks to the API over HTTP (`/api/...`) only.

## Production (Render, etc.)

Set `JWT_SECRET`, and `FRONTEND_ORIGIN` to your Firebase site URL(s), comma-separated. See **`../DEPLOYMENT.md`** in the project root.
