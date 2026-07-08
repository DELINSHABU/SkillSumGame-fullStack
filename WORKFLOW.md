# SkillSum — Phone Test & Fix Workflow

How to run SkillSum on your phone as an installed, offline-capable app, and how the
fix-on-laptop → update-on-phone loop works. One-time setup lives in [DEPLOY.md](./DEPLOY.md);
this doc is the day-to-day loop.

## The loop at a glance

```
 ┌──────────────────────────────────────────────────────────────┐
 │  1. Code on laptop            (npm run dev:api + dev:web)    │
 │  2. Verify                    (npm run typecheck && npm test)│
 │  3. git commit + git push origin main                        │
 │  4. Auto-deploy               Vercel ~2 min · Render ~5 min  │
 │  5. Phone: close + reopen the SkillSum app  →  new version   │
 │  6. Test on phone (incl. airplane mode)                      │
 │  7. Found a bug? → back to 1                                 │
 └──────────────────────────────────────────────────────────────┘
```

There is no manual "update the phone" step. The installed PWA fetches the new service
worker on next launch, activates it immediately (`skipWaiting`), and serves the new build.

## 1. Local development

```bash
npm run dev:api    # Hono API on :4000 (needs local Postgres, DATABASE_URL in apps/api/.env)
npm run dev:web    # Next.js on :3000, proxies /api/* to :4000
```

- The **service worker is disabled in dev** — offline behavior can't be tested with `next dev`.
- To test the PWA/offline locally:
  ```bash
  npm run build -w apps/web && npm run start -w apps/web
  ```
  then open `http://localhost:3000`. `localhost` counts as a secure context, so the
  service worker installs without HTTPS. Use DevTools → Application → Service Workers.

## 2. Installing the app on your phone (once)

1. Open the Vercel URL in **Chrome on Android** → accept the "Add SkillSum to Home screen"
   prompt (or ⋮ menu → *Add to Home screen* → *Install*).
2. **iPhone**: Safari → Share → **Add to Home Screen** (iOS never shows an install prompt).
3. The app opens standalone (no browser chrome), portrait, with the SkillSum icon.

No account on the phone yet? Tap **"Play as guest (works offline)"** — progress stays on
the device and is replayed into your account if you sign up later.

## 3. Deploying a change

```bash
npm run typecheck && npm test     # required green before commit (AGENTS.md rule 12)
git add -A && git commit -m "fix(web): …"
git push origin main
```

What happens automatically:

| Host | Trigger | What runs | Time |
|------|---------|-----------|------|
| Vercel | push to `main` | `next build --webpack` in `apps/web` (includes the service worker) | ~2 min |
| Render | push to `main` | `npm install` → **drizzle migrations** → esbuild bundle → restart | ~5 min |

- **Schema change?** `npm run db:generate -w apps/api`, commit the new file in
  `apps/api/drizzle/` — Render applies it on deploy. Never edit an applied migration.
- Check progress: Vercel dashboard → Deployments; Render dashboard → Events/Logs.

## 4. How the phone picks up the update

1. Deploy finishes on Vercel.
2. **Fully close the installed app** (swipe away from recents) **and reopen it** — the
   service worker checks for updates on launch, downloads the new precache, and activates
   immediately. Sometimes one extra close/reopen is needed (old page loads, new SW installs
   in background, next launch serves it).
3. Confirm which build you're on: **Profile page → "Version abc1234"** at the bottom —
   compare with `git log --oneline -1` on the laptop.

If the phone seems stuck on an old build: Android Chrome → site settings → *Clear & reset*
(nuclear option), then reopen. This also wipes offline progress, so sync first.

## 5. Testing offline on the phone

Full offline script:

1. Open the app online once (lets the service worker precache everything).
2. Play one level online — confirm it saves normally.
3. **Airplane mode ON.**
4. Reopen the app: home, Learn, world map, levels, Practice all work.
5. Play a level — post-game screen shows XP/stars plus
   *"📴 Saved on this device — will sync when you're back online"*.
6. Kill the app, reopen (still offline) — progress from step 5 is still there.
7. **Airplane mode OFF**, reopen the app: the "☁️ Syncing n games…" pill appears, then
   disappears. XP/streak now match on another device/browser.

What works offline vs. not:

| Works fully offline | Degrades offline |
|---|---|
| Home, Learn worlds/levels, playing any level | Profile history/stats (last-synced values) |
| Practice (all modes) with XP/stars | Daily **claim** + streak update (applies after sync) |
| Daily challenge tasks (same seed as server) | Login/signup (needs network) |

## 6. Debugging from the phone

- **Android**: plug in USB, enable USB debugging, open `chrome://inspect` on the laptop →
  inspect the PWA. Full DevTools: Console, Network, **Application → Service Workers /
  IndexedDB → `skillsum-local`** (see `pendingSessions` queue live).
- **iPhone**: Mac Safari → Develop menu → phone → the PWA (enable Web Inspector on iOS
  Settings → Safari → Advanced).
- **API errors**: Render dashboard → Logs (the web app only talks to `/api/*`, which the
  Vercel rewrite proxies to Render).
- Quick sanity: `https://<render-app>.onrender.com/api/health` → `{"ok":true}`.

## 7. Gotchas

- **Render cold start**: free tier sleeps after ~15 min idle; first API call takes 30–50 s.
  The GitHub Actions keepalive (`.github/workflows/keepalive.yml`, needs the
  `API_HEALTH_URL` repo variable) pings it every 10 min. Offline play is unaffected —
  only login and sync feel it.
- **iOS quirks**: no install prompt (Share → Add to Home Screen); iOS may evict the
  service worker + IndexedDB after weeks of disuse — open the app occasionally.
- **The optimistic result vs. server truth**: XP/stars shown offline are computed with the
  exact same math the server runs, but the server recomputes on sync and its numbers win.
  Streak days are always decided by the server date — a game played offline today but
  synced tomorrow credits tomorrow's streak.
- **Never wipe local data on errors**: only explicit logout clears the device. If the
  session cookie expires while offline, the app keeps rendering from the local snapshot.
- **Big refactor looks broken on the phone?** Old SW may serve stale chunks: close/reopen
  twice; if still wrong, clear site data and reinstall.

## Architecture cheat-sheet (what makes this work)

| Piece | File | Job |
|---|---|---|
| Manifest | `apps/web/src/app/manifest.ts` | installability, icon, standalone display |
| Service worker | `apps/web/src/app/sw.ts` (Serwist) | precache app shell, runtime caching, `/~offline` fallback |
| Icons | `apps/web/scripts/generate-icons.mjs` | regenerate PNGs from `public/icons/pwa/icon.svg` |
| Local store | `apps/web/src/lib/localStore.ts` | IndexedDB: snapshots, mastery, pending queue |
| Data layer | `apps/web/src/lib/data.ts` | network-first reads w/ fallback, optimistic `submitSession` |
| Sync engine | `apps/web/src/lib/sync.ts` | drains queue on start/online/foreground |
| Idempotency | `apps/api/src/routes/sessions.ts` | `clientSessionId` unique index — replays never double-credit |
| Deploy | `render.yaml`, DEPLOY.md | Render blueprint + Vercel setup |
