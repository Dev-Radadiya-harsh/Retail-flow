# Deploy RetailFlow: Firebase Hosting (frontend) + Render (backend)

This guide walks through hosting the **React app** on **Firebase Hosting** and the **Express API** on **Render**, and wiring them together with environment variables.

---

## What you need

- A [Firebase](https://console.firebase.google.com/) project (free Spark plan is enough for Hosting).
- A [Render](https://render.com/) account (free tier available).
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- Node.js installed locally (for builds).

---

## Important: SQLite on Render

This project uses **SQLite** (`backend/db/retailflow.db`). On Render, the filesystem is **ephemeral**: when the service restarts, redeploys, or sleeps, **the database file can be wiped or reset**. The app will re-seed empty data if the DB is missing.

For a **school demo**, that is often acceptable. For **real production**, plan to move to **PostgreSQL** (Render offers managed Postgres) or attach a **persistent disk** (paid) and point SQLite there.

---

## Part A — Deploy the backend on Render

### 1. Push your code to GitHub

Render deploys from a Git repository. Push the whole `RetailFlow` repo (including the `backend/` folder).

### 2. Create a Web Service on Render

1. In Render: **New +** → **Web Service**.
2. Connect your GitHub repo and select the branch (e.g. `main`).
3. Configure:

| Setting | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |

4. **Instance type**: Free is OK for testing (cold starts ~30–60s after idle).

5. **Environment variables** (Render → your service → Environment):

| Key | Example / notes |
|-----|------------------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Long random string (generate e.g. `openssl rand -hex 32`) — **required** in production |
| `FRONTEND_ORIGIN` | Your Firebase URL(s), comma-separated, **no spaces**: `https://your-project-id.web.app,https://your-project-id.firebaseapp.com` |
| `PORT` | **Do not set manually** on Render — Render injects `PORT` automatically. |

6. Deploy and wait until the service shows **Live**. Copy the URL, e.g. `https://retailflow-api-xxxx.onrender.com`.

7. Test in a browser or terminal:  
   `https://YOUR-SERVICE.onrender.com/api/health`  
   You should see JSON like `{ "status": "ok", ... }`.

### 3. CORS

The backend reads `FRONTEND_ORIGIN` and only allows those origins. It must **exactly** match the site where the React app runs (scheme + host, no trailing slash), e.g. `https://myapp.web.app`.

---

## Part B — Build the frontend with your API URL

The frontend must know the Render API base URL **when you run `npm run build`**, because Vite bakes `VITE_*` variables into the static files.

### 1. Create `.env.production` inside the **`frontend/`** folder (next to `frontend/package.json`)

```env
VITE_API_BASE_URL=https://YOUR-SERVICE-NAME.onrender.com/api
```

- Replace with your **real** Render URL.
- Must end with `/api` (same as local dev: requests go to `/api/...` on the server).

### 2. Build

From the **repository root**:

```bash
cd /path/to/RetailFlow
npm install
cd frontend && npm install && cd ..
npm run build
```

(`npm run build` runs `cd frontend && npm run build`.) This creates **`frontend/dist/`**.

### 3. Test the build locally (optional)

```bash
npm run preview
```

Open the preview URL; login only works if Render is running and CORS includes whatever origin you use for preview (usually `localhost` — you can add `http://127.0.0.1:4173` or similar to `FRONTEND_ORIGIN` temporarily).

---

## Part C — Firebase Hosting

### 1. Install CLI and log in

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Hosting (once per machine / project)

From the **RetailFlow root** (where `firebase.json` is):

```bash
firebase init hosting
```

- Select your Firebase project.
- **Public directory**: `frontend/dist` (or run `firebase init` and choose this if the repo already has `firebase.json` pointing there)
- **Single-page app**: Yes (rewrites are already in `firebase.json`).
- **Overwrite firebase.json**: No (keep the repo version).

If you already have `firebase.json`, you can skip init and only run:

```bash
firebase use --add
```

to link the Firebase project (creates/updates `.firebaserc`).

### 3. Deploy

After `npm run build` (with `.env.production` set):

```bash
firebase deploy --only hosting
```

Your app will be at:

- `https://YOUR-PROJECT-ID.web.app`
- `https://YOUR-PROJECT-ID.firebaseapp.com`

Add **both** to Render `FRONTEND_ORIGIN` if you use both URLs.

### 4. Update Render CORS after you know the Firebase URL

If login fails with a network/CORS error, check:

1. `FRONTEND_ORIGIN` on Render matches the exact URL you open (including `https`).
2. Rebuild/redeploy frontend if you changed `VITE_API_BASE_URL`.

---

## Checklist

- [ ] Render web service: root `backend`, start `node index.js`, env vars set.
- [ ] `/api/health` works on Render.
- [ ] `frontend/.env.production` has `VITE_API_BASE_URL=.../api`.
- [ ] `npm run build` completed; `frontend/dist/` exists.
- [ ] `FRONTEND_ORIGIN` on Render includes your Firebase Hosting URL(s).
- [ ] `firebase deploy --only hosting` succeeded.

---

## Troubleshooting

| Problem | What to check |
|--------|----------------|
| **Blank page / 404 on refresh** | `firebase.json` should rewrite all routes to `/index.html` (already in repo). |
| **Login fails, CORS in browser console** | `FRONTEND_ORIGIN` must match the Firebase URL exactly; no typo; redeploy backend after changing env. |
| **401 / network on API** | Render URL wrong in `VITE_API_BASE_URL`; rebuild frontend after fixing. |
| **Database empty after a while** | Expected on free Render + SQLite — see note at top. |

---

## Optional: CI build with secrets

You can store `VITE_API_BASE_URL` in GitHub Actions secrets and run `npm run build` in a workflow, then deploy `dist/` with Firebase CI — same idea: the variable must be present at **build** time.

---

## Files added for deployment

| File | Purpose |
|------|--------|
| `firebase.json` | Hosting: serve `frontend/dist`, SPA fallback |
| `frontend/.env.production.example` | Copy to `frontend/.env.production` with your Render `/api` URL |
| `DEPLOYMENT.md` | This guide |

Code: `VITE_API_BASE_URL` in `frontend/src/services/api.js`, login in `frontend/src/context/AuthContext.jsx`, CORS in `backend/index.js`.
