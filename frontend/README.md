# RetailFlow frontend (React + Vite)

This folder is the **only** place for the browser UI: React components, pages, styles, and the Vite dev server.

## Commands

From **this folder**:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output: dist/
npm run preview  # test production build locally
```

From the **repository root** (parent folder), you can run the same via:

```bash
npm run dev
npm run build
```

## API in development

`vite.config.js` proxies `/api` → `http://localhost:3001`. Start the backend separately, or use `npm run dev:all` from the repo root.

## Production API URL

Set `VITE_API_BASE_URL` in `.env.production` before `npm run build` (see `.env.production.example` and root `DEPLOYMENT.md`).

Do not put backend code here; the app calls the API over HTTP only.
