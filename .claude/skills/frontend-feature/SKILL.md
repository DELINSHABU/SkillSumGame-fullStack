---
name: frontend-feature
description: How to build SkillSum frontend features (apps/web, Next.js 14 App Router). Use whenever creating pages, components, hooks, or client-side data fetching. Triggers on any frontend/page/component/screen/navigation work. Pair with soft-arcade-ui for styling rules.
---

# Frontend Feature Pattern — SkillSum

Next.js 14 App Router, TypeScript strict, Tailwind + CSS variables. Styling rules live in the `soft-arcade-ui` skill — read both when building UI.

## File placement

- Pages: `src/app/(app)/<route>/page.tsx` (protected) or `src/app/(auth)/` (public login/signup). Middleware guards on the `sid` cookie.
- Components: `src/components/<area>/<Name>.tsx` — areas: `ui` (generic), `shared` (app-wide), `game`, `learn`, `practice`, `daily`, `profile`. **One component per file, named export, no default exports for components.**
- Hooks: `src/hooks/use<Name>.ts`.

## Hard rules

1. **All HTTP through `src/lib/api.ts`** (`api.auth.*`, `api.sessions.*`, …). Never raw `fetch()` in a component. New endpoint → add a typed method there first.
2. **Game types/math from `@skillsum/shared`** — `getLevelById`, `getLevelsByWorld`, `WORLDS_META`, `generateQuestion`, `configKey`. Level data is static and imported directly; only user progress comes from the API.
3. **Routing**: `next/link` + `useRouter`/`useParams` from `next/navigation`. Never `window.location`, never `next/router`.
4. **Client components** (`'use client'`) for anything with state/effects — which is most screens. Fetch in `useEffect`, show `<LoadingScreen />` until data lands, surface errors with a retry button (see the save-retry pattern in `src/app/(app)/play/[levelId]/page.tsx`).
5. **Multi-step screens are state machines**: one page component with a `Phase` union (`'pre' | 'playing' | 'saving' | 'post'`) rendering one sub-component per phase. See play and practice pages.
6. **Gameplay reuses `GameScreen`** (`src/components/game/GameScreen.tsx`) — props select timer/target/star-bar/zen behavior. Never fork a second gameplay loop.
7. **No `<form>` in game UI**; buttons with onClick. No localStorage/sessionStorage — durable client persistence is IndexedDB via `src/lib/localStore.ts` only (offline-first layer).
8. Ephemeral gameplay state stays in React state/refs; results go through `src/lib/data.ts` `submitSession` (optimistic offline result + sync queue). The server's response is still the truth (XP, stars, achievements) — it overwrites the optimistic result on sync. Reads go through the offline-first fetchers in `data.ts`, not `api.*` directly.

## Gate before commit

`npm run typecheck -w apps/web` and `npm run build -w apps/web` both clean. No `any`, no `@ts-ignore`, no `ignoreBuildErrors`.
