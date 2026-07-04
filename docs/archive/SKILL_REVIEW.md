# SKILL: `review-code` — SkillSum 2.0 Code Health Review
### Run this review at the end of every phase, and any time something breaks.
### Cross-platform edition: OpenCode, Gemini, Warp, Codex

---

## How to Invoke This Skill

Add to your prompt:

> "Using the **review-code** skill, review the current state of the project"

> "Using the **review-code** skill, review [specific file or folder]"

The AI must execute every check in this document in order, report findings clearly, and state the severity of each finding (`BLOCKER`, `WARNING`, or `CLEANUP`). Do not fix issues silently — report them first, then fix with confirmation.

### Cross-Platform Invocation Contract

Use this wrapper in any assistant:

> "Use SkillSum skill: `review-code`. Run all sections in `SKILL_REVIEW.md` in order. Report findings in the required severity format before code changes."

### Review Response Contract (Mandatory)

Every review result must include:
1. Scope reviewed (full project or specific paths)
2. Evidence commands run (or equivalent tool checks)
3. Findings grouped by `BLOCKER`, `WARNING`, `CLEANUP`
4. Build/lint/typecheck status
5. A fix plan ordered by risk

### Fix Permission Rule

- By default, review mode is read-only reporting
- Only apply fixes immediately if the user explicitly asks for "review and fix"
- If fix permission is unclear, ask one clarification question before editing

---

## What This Review Catches

This document was built from a real audit of a broken SkillSum build. Every check here maps to a real failure that occurred. The sections are:

1. Architecture integrity (the most common cause of full project breakage)
2. TypeScript health
3. Supabase usage correctness
4. Routing correctness
5. State management correctness
6. Game logic correctness
7. UI system compliance
8. Build & lint health
9. Common AI-introduced bugs (the most important section)

Run all sections every time. Do not skip sections because "I didn't touch that area."

---

## SECTION 1 — Architecture Integrity

These are the checks that prevented the previous project from working at all. Run these first.

### 1.1 — Routing Method Consistency

Search the entire codebase for these patterns. Any match is a `BLOCKER`.

```bash
# Run these searches from project root:
grep -r "from 'next/router'" src/
grep -r "window.location" src/
grep -r "useRouter.*next/router" src/
```

**Expected result:** Zero matches. Every router usage must be `next/navigation`.

**If found:** Replace immediately.
```typescript
// WRONG — Pages Router
import { useRouter } from 'next/router'

// CORRECT — App Router
import { useRouter } from 'next/navigation'
```

### 1.2 — No `pages/` Directory

```bash
ls src/pages 2>/dev/null && echo "BLOCKER: pages/ directory exists" || echo "OK"
```

**Expected result:** Directory does not exist. All routes must be in `src/app/`.

### 1.3 — No Legacy Components in Active Import Chain

Check that these files are NOT imported by any active component:

```bash
grep -r "StartScreen\|EndScreen\|CampaignMapScreen\|LevelIntroScreen\|LeaderboardScreen\|SkillSumGame" src/app/ src/components/learn src/components/practice src/components/profile
```

**Expected result:** Zero matches. Legacy components must be deleted or isolated in an `/archive/` folder.

**Severity:** If found in active routes → `BLOCKER`. If only in dead import chain → `WARNING`.

### 1.4 — Build Flags Are Not Suppressing Errors

Check `next.config.ts` for these lines:

```typescript
typescript: { ignoreBuildErrors: true }   // BLOCKER if present
eslint: { ignoreDuringBuilds: true }       // BLOCKER if present
```

**These must be REMOVED before any phase is considered complete.** While present, the build will pass even when the code is broken.

### 1.5 — No Mixed Persistence (Supabase + localStorage)

```bash
grep -r "localStorage\|sessionStorage" src/
```

**Expected result:** Zero matches. All persistence must go through Supabase.

**If found:** Every `localStorage` call is a `BLOCKER`. Replace with Supabase read/write.

---

## SECTION 2 — TypeScript Health

### 2.1 — Run the TypeScript Compiler

```bash
npx tsc --noEmit
```

**Expected result:** Zero errors.

Report every error with:
- File path and line number
- The error message
- Severity (`BLOCKER` = prevents build, `WARNING` = type escape used)

Common errors found in the previous broken build and what they mean:

| Error | Root Cause | Fix |
|---|---|---|
| `TS7016: Could not find declaration file for 'next-pwa'` | Missing type declaration | Create `src/types/next-pwa.d.ts` with `declare module 'next-pwa'` |
| `Property 'star3Score' does not exist on type 'Level'` | Level type and data out of sync | Add field to `types.ts` OR rename to match (`targetScore`) |
| `Type 'string' is not assignable to type 'DailyChallenge'` | Supabase returns raw DB shape, not your TS type | Map DB response in the hook before returning |
| `Cannot find module` | Missing import or wrong path alias | Check `tsconfig.json` paths, verify `@/` is configured |
| `useEffect is not defined` | Hook imported from wrong place or not imported | Add `import { useEffect } from 'react'` |

### 2.2 — No `any` Usage

```bash
grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.tsx"
```

**Expected result:** Zero matches in production code.

Every `any` is a `WARNING`. It means either:
- The type in `types.ts` is incomplete (fix the type)
- A Supabase response isn't being mapped correctly (map it in the hook)

### 2.3 — All Types Defined in `types.ts`

```bash
# Check for inline type definitions in component files
grep -rn "interface \|type [A-Z]" src/components/ src/app/
```

Review each match. Any type defined outside of `src/lib/game/types.ts` is a `WARNING` and should be moved.

---

## SECTION 3 — Supabase Usage

### 3.1 — Server Client Used in Server Contexts Only

```bash
grep -rn "supabase/server" src/components/ src/hooks/
```

**Expected result:** Zero matches. The server client (`@/lib/supabase/server`) must ONLY be used in:
- `src/app/**/page.tsx`
- `src/app/**/layout.tsx`
- `src/app/api/**/route.ts`

If found in `src/components/` or `src/hooks/` → `BLOCKER`.

### 3.2 — Browser Client Used in Client Contexts Only

```bash
grep -rn "supabase/client" src/app/ --include="*.tsx"
```

Review each match. Server Component pages (`async function Page()` with no `'use client'`) must NOT use the browser client.

### 3.3 — Auth Check in Every API Route

Read every file in `src/app/api/`. Each one must have this pattern near the top:

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Any API route without an auth check is a `BLOCKER`.

### 3.4 — RLS Enabled on All Tables

In Supabase dashboard (or via CLI): verify Row Level Security is enabled on all 5 tables:
- `profiles`
- `level_mastery`
- `sessions`
- `user_achievements`
- `daily_progress`

A table with RLS disabled is a `BLOCKER` (exposes all user data).

### 3.5 — No Direct Table Access with Client User ID from Request Body

```bash
grep -rn "req.body.*userId\|body.*user_id" src/app/api/
```

**Expected result:** Zero matches. Never trust a `userId` from the client request body. Always get it from `supabase.auth.getUser()` server-side.

---

## SECTION 4 — Routing & Navigation

### 4.1 — All Routes Exist as Files

Verify these route files exist:

```bash
ls src/app/\(app\)/page.tsx          # Home
ls src/app/\(app\)/learn/page.tsx    # World select
ls src/app/\(app\)/learn/\[worldId\]/page.tsx  # World map
ls src/app/\(app\)/learn/\[worldId\]/\[levelId\]/page.tsx  # Level play
ls src/app/\(app\)/practice/page.tsx
ls src/app/\(app\)/daily/page.tsx
ls src/app/\(app\)/profile/page.tsx
ls src/app/\(auth\)/login/page.tsx
ls src/app/\(auth\)/signup/page.tsx
ls src/app/api/auth/callback/route.ts
ls src/middleware.ts
```

Any missing file is a `BLOCKER` for that feature area.

### 4.2 — `<Link>` Used for Internal Navigation (Not `<a>`)

```bash
grep -rn '<a href="/' src/components/ src/app/
```

**Expected result:** Zero matches. Internal links must use `<Link href="...">` from `next/link`. Plain `<a>` tags trigger full page reloads.

### 4.3 — Debug Routes Not in Production

```bash
ls src/app/debug-profile 2>/dev/null && echo "WARNING: debug route still exists"
ls src/app/\*/debug\* 2>/dev/null
```

Any debug route is a `CLEANUP` item before any public release.

### 4.4 — Middleware Protects All App Routes

Read `src/middleware.ts`. Confirm:
- `(app)` route group is protected (redirects to `/login` if no session)
- `(auth)` route group is public (redirects to `/` if already logged in)
- `/api/auth/callback` is public

---

## SECTION 5 — State Management

### 5.1 — No Game State Written to Supabase During Gameplay

Read `src/components/learn/GameScreen.tsx`. Confirm:
- No `supabase` import
- No Supabase calls inside the component
- The only Supabase interaction happens AFTER `onSessionEnd` is called (in `PostLesson.tsx`)

If `GameScreen.tsx` contains Supabase calls → `BLOCKER`. Active gameplay state (timer, score, current question) must live in React state only.

### 5.2 — `isLoaded` Guard Before Rendering Profile Data

Read every component that renders user data (XP, streak, level, etc.). Confirm each one has a loading guard:

```typescript
if (isLoading) return <LoadingScreen />
if (!profile) return <ErrorState />
// Only here is it safe to render profile data
```

Missing loading guard → `WARNING`. Will cause flash of default/zero values on first render.

### 5.3 — No State Updated After Component Unmount

Look for `useEffect` hooks in `GameScreen.tsx` and any timer-based component. Confirm they return a cleanup function:

```typescript
useEffect(() => {
  const t = setTimeout(() => setTimeLeft(t => (t ?? 0) - 1), 1000)
  return () => clearTimeout(t)  // ← This must exist
}, [timeLeft])
```

Missing cleanup → `WARNING`. Causes "Can't perform a React state update on an unmounted component" errors.

---

## SECTION 6 — Game Logic

### 6.1 — No `eval()` in Question Generator

```bash
grep -rn "eval(" src/lib/
```

**Expected result:** Zero matches. The previous broken project used `eval()` to evaluate math strings with `×` and `÷` symbols, which fails silently. 

**Correct pattern:**
```typescript
function calculate(a: number, operator: OperationType, b: number): number {
  switch (operator) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return Math.floor(a / b)
    default: throw new Error(`Unknown operator: ${operator}`)
  }
}
```

### 6.2 — Star Score Thresholds Are Valid

For every level in `levels.ts`, verify:
```
star1Score < star2Score < targetScore
```

Run a quick script to check:
```typescript
// In a temporary test file or browser console:
import { LEVELS } from './src/lib/game/levels'
const invalid = LEVELS.filter(l => !(l.star1Score < l.star2Score && l.star2Score < l.targetScore))
console.log('Invalid levels:', invalid.map(l => l.id))
```

Any invalid level is a `BLOCKER`.

### 6.3 — Level IDs Are Globally Unique

```typescript
const ids = LEVELS.map(l => l.id)
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
console.log('Duplicate IDs:', duplicates)
```

Any duplicate ID is a `BLOCKER`.

### 6.4 — Level Unlock Logic Is Correct

The rule: Level N is unlocked if Level N-1 has `stars > 0` (at least 1 star).
- Level 1 of World 1 is always unlocked.
- Level 1 of World N (N > 1) requires the boss level of World N-1 to have `stars > 0`.

Check the unlock check function in `levels.ts` or wherever it lives. Confirm it handles:
- First level of a world (no previous level check needed)
- Boss levels (same rule as standard)
- Does NOT require 3 stars — only `stars > 0`

### 6.5 — `onSessionEnd` Is The Only Exit From Gameplay

Read `GameScreen.tsx`. Confirm there is exactly ONE way to exit the gameplay state: calling `onSessionEnd(result)`. There must be no:
- Direct router navigation from inside `GameScreen`
- State changes that skip `onSessionEnd`
- Ways to end a session without a `SessionResult` being generated

---

## SECTION 7 — UI System Compliance

### 7.1 — No Hardcoded Hex Colors

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components/ src/app/ --include="*.tsx" --include="*.css" | grep -v "globals.css" | grep -v "\.svg"
```

Review each match. Colors used in component JSX that are not CSS variables are `WARNING` items.

### 7.2 — No `bg-pink-300` or Similar Tailwind Color Overrides

```bash
grep -rn "bg-pink\|text-pink\|border-pink\|bg-green-\|bg-red-\|bg-yellow-\|bg-blue-" src/components/ src/app/ --include="*.tsx"
```

Tailwind color classes for non-utility colors are `WARNING`. They bypass the design system CSS variables.

Exception: `text-green-500` and `text-red-500` are OK only for correct/wrong feedback states where speed matters more than precision.

### 7.3 — Touch Targets Are Minimum 48px

Check all interactive elements in `GameScreen.tsx` and navigation components:
- Numpad buttons: at least `h-12` (48px) or `min-h-[48px]`
- Navigation tab items: at least `h-12`
- Primary action buttons: at least `h-14` (56px, preferred)

Any touch target below 48px is a `WARNING`.

### 7.4 — No `<form>` Tags in Game UI

```bash
grep -rn "<form" src/components/ src/app/ --include="*.tsx"
```

Any `<form>` tag in game components (GameScreen, numpad, practice configurator) is a `BLOCKER`. Use `onClick` handlers instead.

---

## SECTION 8 — Build & Lint Health

### 8.1 — Lint Check

```bash
npm run lint
```

Every lint error must be resolved before a phase is considered complete.

Common lint errors found in the previous broken build:

| Error | Fix |
|---|---|
| `react-hooks/rules-of-hooks` — hook inside condition | Move hook to top of component, use condition inside it |
| `react-hooks/exhaustive-deps` — missing dependency | Add the dependency OR extract to a `useCallback` |
| `@typescript-eslint/no-explicit-any` | Replace `any` with the correct type from `types.ts` |
| `react/no-unescaped-entities` — `'`, `"` in JSX text | Use `&apos;` or `&quot;` or move text to a variable |
| `no-unused-vars` | Remove unused imports and variables |

### 8.2 — Build Check

```bash
npm run build
```

The build must pass with zero errors. Warnings are acceptable but should be noted.

### 8.3 — PWA Manifest References Real Files

Read `public/manifest.json`. Check every file listed under `"icons"` and `"screenshots"`. Run:

```bash
# For each icon in manifest.json:
ls public/icon-192.png
ls public/icon-512.png
ls public/apple-touch-icon.png
```

Any manifest reference to a non-existent file is a `WARNING` (breaks PWA install).

---

## SECTION 9 — Common AI-Introduced Bugs (Read This Carefully)

This section documents the exact mistakes AI coding assistants make repeatedly in this project. Check for all of these at every review.

---

### BUG-01: Using `next/router` Instead of `next/navigation`

**How it happens:** AI defaults to the Pages Router pattern. It writes `import { useRouter } from 'next/router'` even in App Router projects.

**Symptom:** Navigation works in development but `useRouter()` throws an error or returns `undefined` in some contexts.

**Check:** `grep -rn "next/router" src/`

**Fix:** Replace every instance with `next/navigation`.

---

### BUG-02: Creating Supabase Client Inline

**How it happens:** AI writes `createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...)` inside a hook or component instead of importing the singleton from `@/lib/supabase/client`.

**Symptom:** Works, but creates a new WebSocket connection per component render. Also causes auth state inconsistencies.

**Check:**
```bash
grep -rn "createBrowserClient\|createClient.*SUPABASE_URL" src/components/ src/hooks/ src/app/
```

**Fix:** Remove inline client creation. Import the singleton: `import { createClient } from '@/lib/supabase/client'`

---

### BUG-03: Adding `'use client'` to Everything

**How it happens:** AI plays it safe and puts `'use client'` at the top of every file to avoid Server Component errors.

**Symptom:** All data fetching happens on the client, killing performance benefits of Server Components.

**Check:**
```bash
grep -rn "'use client'" src/app/ --include="*.tsx"
```

Review each match. If the component has no hooks, no event handlers, and no browser APIs — it should NOT have `'use client'`.

---

### BUG-04: Stale Closure in `useEffect` Timer

**How it happens:** AI writes a countdown timer but the callback captures a stale value of the state variable.

**Symptom:** Timer fires but doesn't decrement correctly, or game ends at wrong time.

**Check:** Look for `setInterval` or `setTimeout` in game components where the callback references state directly instead of using the updater pattern.

```typescript
// WRONG — stale closure
useEffect(() => {
  const t = setInterval(() => {
    setTimeLeft(timeLeft - 1)  // 'timeLeft' is stale here
  }, 1000)
  return () => clearInterval(t)
}, [])  // empty deps array = timeLeft never updates

// CORRECT — updater function
useEffect(() => {
  if (timeLeft <= 0) { endSession(); return; }
  const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
  return () => clearTimeout(t)
}, [timeLeft])  // re-runs each second with fresh value
```

---

### BUG-05: Missing Cleanup on Timer/Interval

**How it happens:** AI adds a `setInterval` or `setTimeout` inside `useEffect` but forgets to return a cleanup function.

**Symptom:** "Warning: Can't perform a React state update on an unmounted component." Timer continues firing after the user navigates away.

**Check:** Every `useEffect` that starts a timer must have `return () => clearInterval(t)` or `return () => clearTimeout(t)`.

---

### BUG-06: `useEffect` / Hook Called Conditionally

**How it happens:** AI puts a `return` statement (early exit) before a hook call in a component.

**Symptom:** React crashes with "Rendered more hooks than during the previous render."

**Check:**
```bash
npx eslint src/ --rule 'react-hooks/rules-of-hooks: error'
```

**Fix:** Move ALL hook calls to the top of the component, before any early returns.

---

### BUG-07: Mismatched DB Column Names vs TypeScript Interface

**How it happens:** Supabase DB uses `snake_case` (`best_score`, `user_id`). AI returns this directly and assigns it to a TypeScript interface expecting `camelCase` (`bestScore`, `userId`).

**Symptom:** TypeScript errors like "Property 'bestScore' does not exist" OR runtime errors where values are `undefined` when they should have data.

**Check:** Read every hook in `src/hooks/`. After every Supabase `.select()`, confirm the raw `data` object is mapped to camelCase before being returned.

```typescript
// WRONG — returning DB shape directly
return data  // { best_score: 12, user_id: '...' }

// CORRECT — map to TypeScript shape
return {
  bestScore: data.best_score,
  userId: data.user_id,
  // ...
}
```

---

### BUG-08: Hardcoded User Data / Placeholder Values Left in Production

**How it happens:** AI scaffolds a component with `continueLevel = 7` or `worldId = 1` as a placeholder, intending to replace it later. It never gets replaced.

**Symptom:** Home screen always shows "Level 7, World 1" regardless of actual progress.

**Check:**
```bash
grep -rn "hardcoded\|TODO\|FIXME\|placeholder\|Level 1\|World 1\|continueLevel = " src/components/ src/app/
```

**Fix:** Every piece of user-specific data must come from the Supabase profile or mastery data.

---

### BUG-09: `eval()` in Question Generator

**How it happens:** AI generates math questions as strings like `"34 × 9"` and then uses `eval()` to compute the answer. This fails with `×` and `÷` symbols because JavaScript doesn't recognise them.

**Symptom:** All questions with multiplication or division produce `NaN` or `undefined` answers.

**Check:** `grep -rn "eval(" src/lib/`

**Fix:** Use a `switch` statement on the operator character. See Section 6.1 above.

---

### BUG-10: Multiple Components in One File

**How it happens:** AI adds a small helper component inline at the bottom of a large component file "for convenience."

**Symptom:** Not a runtime error — but causes AI sessions to lose track of what's where, leading to duplicated logic and diverging implementations.

**Check:**
```bash
# Count default exports per file — should be 1
grep -rn "^export default" src/components/ | grep -v ".test."
# Count named component exports — any file with more than one is suspect
grep -rn "^export function\|^export const [A-Z]" src/components/ --include="*.tsx"
```

**Fix:** Extract every additional component into its own file.

---

### BUG-11: Star Score Field Name Inconsistency

**How it happens:** The build plan uses `targetScore` for the 3-star score. The AI sometimes uses `star3Score` instead, or mixes both across different files.

**Symptom:** TypeScript error "Property 'star3Score' does not exist on type 'Level'" in some files, and "Property 'targetScore' does not exist" in others.

**Check:**
```bash
grep -rn "star3Score\|targetScore" src/lib/ src/components/
```

**Fix:** Pick ONE name — `targetScore` is the canonical name in this project. Every reference must use `targetScore`.

---

### BUG-12: Session Written to Supabase Mid-Game

**How it happens:** AI adds a "save progress" feature inside `GameScreen.tsx` to protect against accidental navigation, but writes to Supabase on each correct answer.

**Symptom:** Hundreds of Supabase writes per session. Rate limiting errors. Incorrect session history (partial sessions saved as complete).

**Check:** `grep -rn "supabase" src/components/learn/GameScreen.tsx`

**Fix:** Zero Supabase calls inside `GameScreen`. Write ONLY in `PostLesson.tsx` after `onSessionEnd` is called.

---

## Review Output Format

When running a review, report findings in this format:

```
## Code Review Report — [Date] — [Scope: Phase 3 / Full Project / specific file]

### BLOCKERS (must fix before any new code is written)
- [BUG-01] src/hooks/useUserProfile.ts:12 — uses 'next/router' instead of 'next/navigation'
- [Section 1.5] src/components/home/ContinueLearningCard.tsx:34 — localStorage.getItem() found

### WARNINGS (should fix this session)
- [BUG-07] src/hooks/useMastery.ts:28 — DB shape returned directly without camelCase mapping
- [Section 7.2] src/components/learn/WorldMap.tsx:56 — uses Tailwind 'bg-pink-300' instead of CSS var

### CLEANUP (fix before release)
- [Section 4.3] src/app/debug-profile/ — debug route still in app
- [BUG-10] src/components/profile/ProfileScreen.tsx — StatsTab and HistoryTab defined in same file

### BUILD STATUS
- TypeScript: 3 errors (see BLOCKERS)
- Lint: 2 errors, 4 warnings
- Build: FAILING

### ACTION PLAN
1. Fix all BLOCKERS (estimated: 30 min)
2. Run tsc + lint + build — confirm green
3. Then continue to Phase 4
```

---

*SKILL_REVIEW.md — SkillSum 2.0 | Run at the end of every phase, and any time something breaks | April 2026*
