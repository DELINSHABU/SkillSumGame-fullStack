# Deploying SkillSum (free tier)

Three free services, no credit card required:

| Piece | Host | What it runs |
|-------|------|--------------|
| Postgres | **[Neon](https://neon.tech)** | `DATABASE_URL` (permanent free tier, 0.5 GB) |
| Hono API | **[Render](https://render.com)** | `apps/api` via `render.yaml` |
| Next.js web | **[Vercel](https://vercel.com)** | `apps/web` |

**Why this split:** the API depends on `argon2`, a native C++ module, so it can't run on
Vercel Functions or Cloudflare Workers — it needs a real Node container (Render). The web
app is pure Next.js, so Vercel is the best host. Neon backs both with free Postgres.

> **Trade-off:** Render's free web service spins down after ~15 min idle and cold-starts
> (~30–50s) on the next request. Fine for a demo/portfolio; for always-warm you'd need a
> paid plan or Fly.io.

---

## 0. Prerequisites

This repo has **no git remote** yet. Render and Vercel deploy from GitHub, so first:

```bash
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/SkillSumGame.git
git push -u origin main
```

---

## 1. Database — Neon

1. Sign up at [neon.tech](https://neon.tech) → **Create project** (any name/region).
2. Copy the **connection string** (starts `postgres://...`, includes `?sslmode=require`).
   Use the **pooled** connection string if offered.
3. Keep it handy — it's `DATABASE_URL` for the API.

Migrations run automatically on every Render deploy (see `render.yaml` build command),
so you don't need to run them by hand. The schema comes from `apps/api/drizzle/`.

---

## 2. API — Render

The repo ships a **`render.yaml`** blueprint, so this is mostly automatic.

1. Sign up at [render.com](https://render.com) with GitHub.
2. **New → Blueprint** → pick this repo. Render reads `render.yaml` and proposes the
   `skillsum-api` web service.
3. When prompted, set the one secret env var:
   - **`DATABASE_URL`** = your Neon connection string from step 1.
   - (`NODE_ENV=production` is already set by the blueprint — it enables `secure` cookies.)
4. **Apply**. First deploy runs `npm install --include=dev && npm run db:migrate` (creates
   the tables) then starts the server. Watch the logs until `SkillSum API listening...`.
5. Copy the service URL, e.g. `https://skillsum-api.onrender.com`. Verify:
   `https://skillsum-api.onrender.com/api/health` → `{"ok":true}`.

**Notes**
- Root directory stays the repo root — the whole npm workspace installs so
  `@skillsum/shared` resolves.
- `--include=dev` is required: `tsx` (runs the server) and `drizzle-kit` (migrations) are
  devDependencies, and they'd be skipped under `NODE_ENV=production` without it.

---

## 3. Web — Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub → **Add New → Project** → this repo.
2. **Root Directory:** set to **`apps/web`**. Framework auto-detects as Next.js. Leave build
   and install commands at their defaults (Vercel installs the workspace from the repo root).
3. Add one **Environment Variable**:
   - **`API_URL`** = your Render URL from step 2 (e.g. `https://skillsum-api.onrender.com`,
     **no trailing slash**).
   `next.config.mjs` rewrites `/api/*` to this, so the browser only ever talks to your Vercel
   domain — cookies stay same-origin, no CORS.
4. **Deploy**. Open the Vercel URL, sign up, and confirm gameplay saves.

> `transpilePackages: ['@skillsum/shared']` is already set in `next.config.mjs` — the shared
> package is raw TypeScript, and Vercel's production build needs it.

---

## 4. Redeploys

Both hosts auto-deploy on `git push` to `main`. API schema changes: add a migration
(`npm run db:generate -w apps/api`), commit it, push — Render applies it on deploy.

## Env var summary

| Service | Var | Value |
|---------|-----|-------|
| Render (API) | `DATABASE_URL` | Neon connection string |
| Render (API) | `NODE_ENV` | `production` (set by `render.yaml`) |
| Vercel (web) | `API_URL` | Render service URL, no trailing slash |
