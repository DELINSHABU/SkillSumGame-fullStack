---
name: review
description: SkillSum code-health review checklist. Use at the end of any feature/phase, before committing significant changes, or when asked to review/audit/check code quality in this repo. Contains grep gates for the failure modes that killed the previous build.
---

# Review Checklist — SkillSum

Run these gates in order. All must pass before commit. These grep patterns target the exact failure modes of the previous (broken) build.

## 1. Forbidden patterns (must return NOTHING)

```bash
# eval — killed the old question generator
grep -rn --include='*.ts' --include='*.tsx' -E "eval\(|new Function\(" packages/ apps/*/src

# type-safety escapes
grep -rn --include='*.ts' --include='*.tsx' -E ": any\b|as any\b|@ts-ignore|@ts-nocheck" packages/ apps/*/src

# suppressed build errors — masked every bug last time
grep -rn "ignoreBuildErrors\|ignoreDuringBuilds" apps/web

# browser storage — server is the only persistence
grep -rn --include='*.ts' --include='*.tsx' "localStorage\|sessionStorage" apps/web/src

# raw fetch outside the api client
grep -rn --include='*.tsx' "fetch(" apps/web/src/components apps/web/src/app | grep -v "lib/api"

# hex colors outside globals.css (design tokens only)
grep -rn --include='*.tsx' -E "#[0-9a-fA-F]{6}\b" apps/web/src/components apps/web/src/app | grep -v globals.css

# legacy routing
grep -rn "next/router\|window.location" apps/web/src
```

## 2. Machine gates

```bash
npm run typecheck            # zero errors, all workspaces
npm test                     # shared unit + API integration (needs skillsum_test DB)
npm run build -w apps/web    # clean production build
```

## 3. Judgment checks

- New game math or types → are they in `packages/shared` (not duplicated in an app)?
- New API route → zod validation + `requireAuth` + integration test + mirrored in `apps/web/src/lib/api.ts`?
- Session-result handling → does the server recompute (never trust client `xpEarned`/`starsEarned`)?
- Level data touched → invariant tests still pass (star ordering, 400 ids, boss placement)?
- New UI → complies with `soft-arcade-ui` skill (tokens, radii, 48px targets, press feedback)?
- Dates/streaks → computed server-side via `lib/dates.ts` only?
- Migrations → additive new file, never edited an applied one?

## 4. Report format

List findings as `file:line — problem — fix`, most severe first. If all gates pass, say so explicitly with the command outputs.
