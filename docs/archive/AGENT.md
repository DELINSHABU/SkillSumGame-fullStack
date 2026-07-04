# AGENT.md — SkillSum 2.0 AI Agent Rules
### Read this file FIRST before touching any code in this project.

---

## What This File Is

This file contains the rules that every AI session must follow when working on the SkillSum 2.0 codebase. These rules exist because inconsistency destroyed the previous version of this project. **There is no such thing as a "quick shortcut" in this project.** If you are about to break one of these rules, stop and do it the right way instead.

Before every session: scan this file top to bottom. Then check `SKILLS.md` for the relevant skill before writing any code.

---

## Project Identity (Never Forget This)

- **Project name:** SkillSum 2.0
- **What it is:** A mobile-first mental math learning PWA
- **Stack:** Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Supabase, shadcn/ui
- **Database:** Supabase (Postgres) — the ONLY persistence layer
- **Styling:** Tailwind classes + CSS variables defined in `src/app/globals.css`
- **Deployment target:** Vercel

---

## The Non-Negotiable Rules

### RULE 1 — Routing: One Method Only

**✅ DO:**
```typescript
// Navigation in components
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const router = useRouter()
router.push('/learn/1')

<Link href="/learn/1">Go to World 1</Link>
```

**❌ NEVER DO:**
```typescript
// WRONG — legacy Pages Router
import { useRouter } from 'next/router'

// WRONG — bypasses Next.js router
window.location.href = '/learn/1'
window.location.replace('/learn/1')

// WRONG — Pages Router pattern
// Never create files inside src/pages/
```

**Why:** Mixing `next/router` (Pages Router) and `next/navigation` (App Router) causes silent failures and breaks during build.

---

### RULE 2 — Data Persistence: Supabase Only

**✅ DO:**
```typescript
// Always read/write through Supabase
const { data, error } = await supabase
  .from('profiles')
  .update({ xp: profile.xp + earned })
  .eq('id', userId)
  .select()
  .single()
```

**❌ NEVER DO:**
```typescript
// WRONG — no localStorage
localStorage.setItem('userProfile', JSON.stringify(profile))
localStorage.getItem('userProfile')

// WRONG — no sessionStorage
sessionStorage.setItem('currentSession', data)

// WRONG — no IndexedDB
```

**Why:** The entire previous project was built on localStorage. It broke cross-device usage and was the wrong architectural choice. Supabase is the single source of truth.

**Exception:** React `useState` and `useRef` for in-session ephemeral data (e.g. the current active gameplay state, the timer countdown). This data does NOT need to survive a page refresh.

---

### RULE 3 — Supabase Clients: Use the Right One

**In Server Components, Server Actions, Route Handlers — use server client:**
```typescript
import { createClient } from '@/lib/supabase/server'

// Server Component
export default async function ProfilePage() {
  const supabase = createClient()
  const { data: profile } = await supabase.from('profiles').select().single()
  ...
}
```

**In Client Components ('use client') — use browser client:**
```typescript
import { createClient } from '@/lib/supabase/client'

export function ProfileCard() {
  const supabase = createClient()
  ...
}
```

**❌ NEVER DO:**
```typescript
// WRONG — creating a new client inline anywhere
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

### RULE 4 — TypeScript: No `any`, No Shortcuts

**✅ DO:**
```typescript
// All types live in src/lib/game/types.ts
import type { Level, LevelMastery, SessionResult } from '@/lib/game/types'

function calculateStars(result: SessionResult, level: Level): 0 | 1 | 2 | 3 {
  if (result.correct >= level.targetScore) return 3
  if (result.correct >= level.star2Score) return 2
  if (result.correct >= level.star1Score) return 1
  return 0
}
```

**❌ NEVER DO:**
```typescript
// WRONG
function calculateStars(result: any, level: any): any { ... }

// WRONG — inline type definition (put it in types.ts instead)
function doThing(config: { mode: string; time: number }): void { ... }

// WRONG — type assertion to escape type errors
const profile = data as any
```

**Why:** `any` defeats the purpose of TypeScript. If the AI suggests `any`, it means the types in `types.ts` are incomplete. Fix the types first.

---

### RULE 5 — Component Structure: One Component Per File

**✅ DO:**
```
src/components/learn/WorldMap.tsx         ← exports: export default WorldMap
src/components/learn/LevelNode.tsx        ← exports: export default LevelNode
src/components/learn/LevelDetailModal.tsx ← exports: export default LevelDetailModal
```

**❌ NEVER DO:**
```typescript
// WRONG — multiple components in one file
export function WorldMap() { ... }
export function LevelNode() { ... }   // Should be its own file
export function Modal() { ... }       // Should be its own file
```

**Why:** Multi-component files cause AI to lose track of what's where. They also make refactoring harder.

---

### RULE 6 — Server vs Client Components: Be Explicit

**✅ DO:**
```typescript
// If the component uses hooks, browser APIs, or event handlers:
'use client'

import { useState } from 'react'
export default function GameScreen() { ... }

// If the component only renders data passed to it or fetches from server:
// NO 'use client' directive — it's a Server Component by default
export default async function WorldMapPage() { ... }
```

**❌ NEVER DO:**
```typescript
// WRONG — adding 'use client' to every file by default
// 'use client' should only appear when you actually need it

// WRONG — using useState in a Server Component
export default async function Page() {
  const [count, setCount] = useState(0) // ERROR: hooks don't work in Server Components
}
```

**Rule of thumb:** Start with Server Component. Only add `'use client'` when you hit a hook or browser event.

---

### RULE 7 — Styling: Tailwind + CSS Variables, No Inline Styles for Design

**✅ DO:**
```typescript
// Use Tailwind classes
<div className="flex flex-col gap-4 p-6 rounded-2xl bg-white shadow-md">

// Use CSS variables for design tokens
<div style={{ color: 'var(--text-primary)' }}>

// Use cn() from utils for conditional classes
import { cn } from '@/lib/utils'
<div className={cn('base-class', isActive && 'active-class')}>
```

**❌ NEVER DO:**
```typescript
// WRONG — hardcoded hex colors inline (breaks design system)
<div style={{ color: '#1a1a2e', fontSize: '16px', fontWeight: 700 }}>

// WRONG — arbitrary Tailwind values for things already in the design system
<div className="text-[#ff80ab]">   // Use var(--pink-300) instead

// WRONG — creating new CSS classes outside globals.css
// Do not create component-scoped CSS modules
```

---

### RULE 8 — File Imports: Use Path Aliases

**✅ DO:**
```typescript
import { cn } from '@/lib/utils'
import type { Level } from '@/lib/game/types'
import { createClient } from '@/lib/supabase/client'
import WorldMap from '@/components/learn/WorldMap'
```

**❌ NEVER DO:**
```typescript
// WRONG — relative path imports from deep in the tree
import { cn } from '../../../../lib/utils'
import WorldMap from '../../components/learn/WorldMap'
```

**Setup:** Ensure `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`.

---

### RULE 9 — Supabase Queries: Always Handle Errors

**✅ DO:**
```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

if (error) {
  console.error('Failed to fetch profile:', error.message)
  throw new Error('Could not load user profile')
}

// Now safely use profile
```

**❌ NEVER DO:**
```typescript
// WRONG — ignoring error
const { data: profile } = await supabase.from('profiles').select().single()
console.log(profile.xp) // Could crash if profile is null
```

---

### RULE 10 — Forms: No HTML `<form>` Tags in Client Components

**✅ DO:**
```typescript
'use client'
// Use button with onClick handlers
<button onClick={handleSubmit}>Submit</button>
<input value={answer} onChange={e => setAnswer(e.target.value)} />
```

**❌ NEVER DO:**
```typescript
// WRONG — this causes unintended page reloads in React
<form onSubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>
```

**Exception:** Server Actions with `<form action={serverAction}>` are allowed, but only in actual Server Components and only for non-game UI (e.g. settings, profile updates).

---

## Do's and Don'ts Quick Reference

### ✅ ALWAYS DO

- Read `AGENT.md` at the start of every session
- Read the relevant section of `SKILLS.md` before creating any page, component, hook, or route
- Add new types to `src/lib/game/types.ts` before using them
- Run `npx tsc --noEmit` after every significant code change
- Test each screen manually before moving to the next one
- Use `cn()` for conditional class names
- Use `loading.tsx` for routes that fetch data
- Use `error.tsx` for routes that might fail
- Comment non-obvious game logic (XP formula, unlock logic, star calculation)
- Keep component files under 200 lines. If longer, extract sub-components.

### ❌ NEVER DO

- Use `localStorage`, `sessionStorage`, `cookies` for game data
- Use `window.location` for navigation
- Use `import { useRouter } from 'next/router'` (Pages Router — wrong)
- Use `any` type in TypeScript
- Put more than one component in a file
- Create a Supabase client inline inside a component or function
- Use hardcoded hex colors in JSX (use CSS variables or Tailwind classes)
- Scaffold multiple screens at once before testing the previous one
- Install new npm packages without updating this file with why they were added
- Use `framer-motion` in MVP (Phase 0-5) — CSS animations only

---

## How to Handle Uncertainty

When you are unsure how to implement something:

1. **Check `SKILLS.md`** — the relevant skill may already have a template
2. **Check `types.ts`** — if the data structure isn't defined, define it first
3. **Check the existing pattern** — look at the most recently completed similar file and follow that exact pattern
4. **Ask before assuming** — if the task requires creating a new pattern not covered by AGENT.md or SKILLS.md, state that clearly and propose the pattern before writing code

---

## Installed Packages (Reference — Do Not Reinstall)

```json
{
  "dependencies": {
    "next": "14.x",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "recharts": "latest",
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest"
  }
}
```

**shadcn/ui components installed:** `button`, `card`, `dialog`, `progress`, `tabs`, `sheet`

To add a new shadcn component: `npx shadcn@latest add [component-name]` — do not install shadcn packages manually.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       = from Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY  = from Supabase project settings
```

Never hardcode these values in source code. Never commit `.env.local`.

---

## Supabase Table Reference

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | User account info, XP, streak | `id` (= auth user id), `xp`, `daily_streak`, `account_level` |
| `level_mastery` | Stars and best scores per level | `user_id`, `level_id`, `stars` (0-3), `best_score` |
| `sessions` | Full history of every play session | `user_id`, `mode`, `level_id`, `correct`, `xp_earned` |
| `user_achievements` | Unlocked achievement records | `user_id`, `achievement_id`, `unlocked_at` |
| `daily_progress` | Today's challenge completion | `user_id`, `challenge_date`, `completed_all`, `xp_rewarded` |

---

*AGENT.md — SkillSum 2.0 | Update this file if new patterns are established | April 2026*
