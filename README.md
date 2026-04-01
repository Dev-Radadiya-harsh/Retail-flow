# RetailFlow

Retail management app: **React + Vite** UI, **Express + SQLite** API.

## Layout

| Folder | Role |
|--------|------|
| **`frontend/`** | Browser app (`npm run build` → `frontend/dist/`) |
| **`backend/`** | REST API on port 3001, database `backend/db/retailflow.db` |

This repo uses **npm workspaces**: run **`npm install` once at the repo root**. That installs frontend, backend, and root dev tools (ESLint, `concurrently`) into a **single `node_modules` at the root** — you should **not** need separate `node_modules` inside `frontend/` or `backend/` for local development.

**Auth:** Login is **email + password** against the SQLite database (JWT). The **`firebase` npm package is not used.** The file **`firebase.json`** is only for optional **Firebase Hosting** (static deploy). It is **not** Firebase Authentication.

## Quick start

```bash
npm install
npm run dev:all
```

Open **http://localhost:5173**. See **`Q&A.txt`** for details and default logins.

## Docs

- **`Q&A.txt`** — how everything works locally  
- **`DEPLOYMENT.md`** — Firebase Hosting + Render (full detail)  
- **`DEPLOY-QUICK.txt`** — shortest deploy checklist  
- **`frontend/env.production.template`** — copy to `frontend/.env.production` before `npm run build` for production  
- **`frontend/README.md`** / **`backend/README.md`** — per-folder notes  

## Scripts (from repo root)

| Command | Action |
|---------|--------|
| `npm run dev` | Frontend only (Vite) |
| `npm run backend:dev` | API only |
| `npm run dev:all` | Frontend + API |
| `npm run build` | Production build → `frontend/dist` |
| `npm run lint` | ESLint (frontend + backend) |
