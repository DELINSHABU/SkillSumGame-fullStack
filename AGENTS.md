# SkillSum — AI Agent Rules (Canonical)

Read this before writing any code. Applies to all AI coding tools (Claude Code, OpenCode, Kilo Code, Codex). Claude Code users: detailed how-to skills live in `.claude/skills/` — read the relevant one before its task type.

## Project

SkillSum 2.0 — Duolingo-style mental-math game. npm workspaces monorepo:

- `packages/shared` — `@skillsum/shared`. Pure TypeScript game engine: types, 400 levels, question generator, XP, achievements, daily challenges. **Zero runtime dependencies.** Runs identically in browser and server.
- `apps/api` — Hono backend (port 4000). Drizzle ORM + Postgres. Self-built cookie session auth.
- `apps/web` — Next.js 14 App Router frontend (port 3000). Tailwind + "Soft Arcade" design system. Proxies `/api/*` to the Hono server via next.config rewrites (same-origin cookies, no CORS).

Game design source of truth: `../SKILLSUM_2_0_MASTER_GUIDE.md`. Design system: `docs/SKILL_UI.md`.

## Non-negotiable rules

1. **Never `eval()` or `new Function()`.** The question generator uses a `switch` over `SkillType`. (The old build died on this.)
2. **No `any`, no `as any`, no `@ts-ignore`, no `ignoreBuildErrors`/`ignoreDuringBuilds`.** TypeScript strict stays green: `npm run typecheck` must pass before every commit.
3. **All game types live in `packages/shared/src/types.ts`.** Never redefine or inline game types in apps. Import from `@skillsum/shared`.
4. **All game math lives in `packages/shared`** (XP, stars, generation, daily seeding). Never duplicate a formula in an app. The API recomputes XP/stars server-side from raw attempts — client-sent totals are never trusted.
5. **One component per file**, one default-less named export. Components in `apps/web/src/components/<area>/`.
6. **All frontend HTTP goes through `apps/web/src/lib/api.ts`.** Never `fetch()` directly in components. Paths are `/api/...` (same-origin, proxied).
7. **API route pattern:** zod-validate input → auth middleware (`sid` cookie) → Drizzle query → typed JSON response. Every route file in `apps/api/src/routes/`.
8. **DB naming:** `auth_sessions` (login sessions) vs `game_sessions` (gameplay records). Never just "sessions".
9. **Colors only via CSS variables** from `globals.css` (Soft Arcade tokens). No hex literals in components.
10. **Routing:** Next.js App Router only — `next/navigation` + `<Link>`. Never `window.location`, never `pages/`.
11. **Dates/streaks are computed server-side** via one `getTodayDate()` helper. Client never decides streak state.
12. **Tests gate every phase:** `npm run typecheck && npm test` green before commit. Level data invariants (400 ids unique, `star1 < star2 < star3 <= targetScore`) must always pass.

## Commands

```bash
npm run typecheck   # tsc --noEmit across workspaces
npm test            # vitest across workspaces
npm run dev:api     # Hono on :4000
npm run dev:web     # Next.js on :3000
```

## Commit style

Conventional commits, one commit per completed phase/feature: `feat(web): learn mode world map`, `fix(api): streak day boundary`.
