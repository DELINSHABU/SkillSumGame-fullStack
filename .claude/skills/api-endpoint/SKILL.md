---
name: api-endpoint
description: How to add or modify SkillSum API endpoints (apps/api, Hono + Drizzle + zod). Use whenever creating a new route, changing request/response shapes, adding DB queries, or writing API integration tests. Triggers on any backend/API/route/endpoint/database work.
---

# API Endpoint Pattern — SkillSum

Stack: Hono (Node 22) + Drizzle ORM + Postgres + zod. Server on :4000, all routes under `/api/*`, reached by the web app via same-origin proxy.

## The pattern (every route follows it)

```ts
// apps/api/src/routes/<area>.ts
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { someTable } from '../db/schema';

const bodySchema = z.object({ /* validate EVERYTHING */ });

export const areaRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth) // unless route is public (only auth signup/login are)
  .post('/', zValidator('json', bodySchema), async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    // drizzle query → typed JSON response
    return c.json({ ok: true });
  });
```

Then register in `apps/api/src/app.ts`: `app.route('/api/<area>', areaRoutes)`.

## Hard rules

1. **zod-validate every input** (body, query params). No unvalidated `c.req.json()`.
2. **Never trust client game results.** XP, stars, accuracy, streaks are recomputed server-side from raw attempts via `recomputeSession` (`src/lib/trust.ts`) + `@skillsum/shared` math. Client-sent totals are ignored.
3. **Game math imports from `@skillsum/shared`** — never reimplement XP/star/daily formulas here.
4. **Table naming**: `auth_sessions` (login) vs `game_sessions` (gameplay). Schema lives ONLY in `src/db/schema.ts`; changes go through `npm run db:generate` → new migration in `drizzle/` → `npm run db:migrate`. Never edit an applied migration.
5. **Dates/streaks**: server-side only, via `getTodayDate()`/`nextStreak()` in `src/lib/dates.ts`.
6. Errors: `c.json({ error: '<message>' }, <status>)` — 400 invalid, 401 unauthenticated, 404 missing, 409 conflict, 422 implausible session data.
7. Auth cookie: `sid`, httpOnly, holds raw token; DB stores sha256 hash (`src/auth/session.ts`).

## Tests (required for every new route)

Integration tests in `src/__tests__/`, run against real `skillsum_test` DB:

```ts
import { beforeAll, beforeEach } from 'vitest';
import { createApp } from '../app';
import { cookieHeader, json, migrateTestDb, signup, truncateAll } from './helpers';

const app = createApp();
beforeAll(migrateTestDb);
beforeEach(truncateAll);
// signup(app) → { sid }; app.request(path, { headers: cookieHeader(sid) })
```

Cover: happy path, 401 without cookie, zod rejection, and any conflict/idempotency case. Gate: `npm run typecheck && npm test -w apps/api`.

After adding a route, mirror it in the web client `apps/web/src/lib/api.ts` with typed request/response.
