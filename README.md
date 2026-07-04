# SkillSum 2.0 🧠

Duolingo-style mental-math game. 400 levels across 8 worlds, practice modes, daily challenges, XP/streaks/achievements. Full-stack TypeScript monorepo — no Supabase, self-hosted backend.

## Stack

| Layer | Tech |
|---|---|
| `packages/shared` | Pure TS game engine — types, 400 levels, question generator, XP, achievements, daily seeding. Zero deps, runs in browser and server |
| `apps/api` | Hono (port 4000) + Drizzle ORM + Postgres. Self-built cookie-session auth (argon2) |
| `apps/web` | Next.js 14 App Router + Tailwind + CSS-variable design system ("Soft Arcade"). Proxies `/api/*` to Hono |

## First-time setup

```bash
# 1. Install
npm install

# 2. Create databases (one time, needs sudo)
sudo -u postgres psql \
  -c "CREATE ROLE skillsum LOGIN PASSWORD 'skillsum_dev';" \
  -c "CREATE DATABASE skillsum OWNER skillsum;" \
  -c "CREATE DATABASE skillsum_test OWNER skillsum;"

# 3. Apply migrations
npm run db:migrate -w apps/api

# 4. Run (two terminals)
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000  ← open this
```

Env: `apps/api/.env` (copy from `.env.example`).

## Commands

```bash
npm run typecheck   # tsc across all workspaces
npm test            # vitest: shared engine + API integration (needs skillsum_test)
npm run build       # production builds
npm run db:generate -w apps/api   # new migration after schema.ts change
```

## Architecture notes

- **Server-side trust**: the client submits raw question attempts; the API recomputes correct/accuracy/streak/stars/XP itself and rejects inconsistent or implausibly fast sessions (422). Client totals are never trusted.
- **Deterministic dailies**: challenges are seeded from the date — every player gets the same 3 tasks; 2000 XP claimable exactly once (guarded by `xp_rewarded`).
- **Level unlocking**: level N needs N−1 passed; world N needs world N−1's boss beaten.
- Known v1 trust boundary: questions are generated client-side, so the server can't verify question authenticity — only plausibility.

## AI-assisted development

Read `AGENTS.md` first (canonical rules for Claude Code / OpenCode / Kilo Code / Codex). Task-specific skills in `.claude/skills/`:
`soft-arcade-ui` · `api-endpoint` · `frontend-feature` · `game-data` · `review`.

Game design source of truth: `../SKILLSUM_2_0_MASTER_GUIDE.md`. Design system: `docs/SKILL_UI.md`.
