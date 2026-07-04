# SKILLS.md — SkillSum 2.0 Reusable AI Skill Instructions
### Reference this file before writing code for any of the task types below.

---

## How to Use This File

When you give the AI a task, **name the skill** in your prompt:

> "Using the **create-page** skill, create the World Map page at `/learn/[worldId]`"

> "Using the **create-component** skill, create the `LevelNode` component"

> "Using the **create-supabase-hook** skill, create a hook to fetch and save level mastery"

The AI must read the relevant skill section before writing any code, and must follow the template exactly. The goal is that every file created with the same skill looks and works the same way.

---

## Skill Index

1. [create-page](#skill-1-create-page)
2. [create-component](#skill-2-create-component)
3. [create-client-component](#skill-3-create-client-component)
4. [create-supabase-hook](#skill-4-create-supabase-hook)
5. [create-api-route](#skill-5-create-api-route)
6. [create-game-screen](#skill-6-create-game-screen)
7. [add-type](#skill-7-add-type)
8. [add-level-data](#skill-8-add-level-data)

---

## Skill 1: `create-page`

**Use when:** Creating a new page file inside `src/app/(app)/`

### Decision Tree

```
Does this page need hooks, user interaction, or browser APIs?
├── NO  → Server Component page (default, no directive)
└── YES → Add 'use client' directive, or extract interactive parts to a Client Component
          and keep the page itself as a Server Component that passes data as props
```

**Preferred pattern (server page + client component):**
```
app/(app)/learn/[worldId]/page.tsx   ← Server Component: fetches data
components/learn/WorldMap.tsx         ← Client Component: renders interactively
```

### Template A — Server Component Page (Data Fetching)

```typescript
// src/app/(app)/learn/[worldId]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLevelsByWorld } from '@/lib/game/levels'
import WorldMap from '@/components/learn/WorldMap'
import type { MasteryMap } from '@/lib/game/types'

interface PageProps {
  params: { worldId: string }
}

export default async function WorldMapPage({ params }: PageProps) {
  const supabase = createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch data
  const worldId = parseInt(params.worldId)
  const levels = getLevelsByWorld(worldId)

  const { data: masteryRows, error } = await supabase
    .from('level_mastery')
    .select('*')
    .eq('user_id', user.id)
    .in('level_id', levels.map(l => l.id))

  if (error) throw new Error('Failed to load mastery data')

  // 3. Transform into MasteryMap (levelId → mastery)
  const mastery: MasteryMap = {}
  for (const row of masteryRows ?? []) {
    mastery[row.level_id] = {
      levelId: row.level_id,
      stars: row.stars,
      bestScore: row.best_score,
      bestAccuracy: row.best_accuracy,
      attempts: row.attempts,
      lastPlayedAt: row.last_played_at,
      weakSkillsDetected: [],
    }
  }

  // 4. Render Client Component with server data as props
  return <WorldMap levels={levels} mastery={mastery} worldId={worldId} />
}
```

### Template B — Simple Page with No Fetching

```typescript
// src/app/(app)/practice/page.tsx
import PracticeConfigurator from '@/components/practice/PracticeConfigurator'

export default function PracticePage() {
  return <PracticeConfigurator />
}
```

### Rules for create-page

- ✅ Always import `createClient` from `@/lib/supabase/server` (NOT client)
- ✅ Always check auth with `supabase.auth.getUser()` and `redirect('/login')` if no user
- ✅ Always handle errors from Supabase queries (throw or show error UI)
- ✅ Export `metadata` for SEO if this is a top-level page
- ❌ Never use `useState` or `useEffect` in a Server Component page
- ❌ Never call `createClient` from `@/lib/supabase/client` in a page file
- ❌ Never put game logic inside the page file — use lib functions

---

## Skill 2: `create-component`

**Use when:** Creating a Server Component that just renders data passed to it (no hooks).

### Template

```typescript
// src/components/learn/WorldSelectGrid.tsx
import Link from 'next/link'
import { WORLDS } from '@/lib/game/levels'
import type { MasteryMap } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface WorldSelectGridProps {
  mastery: MasteryMap
  unlockedWorlds: number[]   // world IDs that are unlocked
}

export default function WorldSelectGrid({ mastery, unlockedWorlds }: WorldSelectGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {WORLDS.map((world) => {
        const isUnlocked = unlockedWorlds.includes(world.id)
        const levelsDone = Object.values(mastery).filter(
          m => m.stars > 0
        ).length

        return (
          <Link
            key={world.id}
            href={isUnlocked ? `/learn/${world.id}` : '#'}
            aria-disabled={!isUnlocked}
            className={cn(
              'relative flex flex-col gap-2 p-4 rounded-2xl text-white transition-transform active:scale-95',
              `world-${world.id}-gradient`,
              !isUnlocked && 'opacity-50 cursor-not-allowed pointer-events-none'
            )}
          >
            <span className="text-3xl">{world.icon}</span>
            <span className="font-bold text-lg leading-tight">{world.name}</span>
            <span className="text-sm opacity-80">{levelsDone}/50 levels</span>
            {!isUnlocked && (
              <span className="absolute top-3 right-3 text-xl">🔒</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
```

### Rules for create-component

- ✅ Always define a typed `interface` for props — never use `any`
- ✅ Always use `cn()` from `@/lib/utils` for conditional classes
- ✅ Always use `<Link>` from `next/link` for internal navigation
- ✅ Keep the component focused — if it exceeds 150 lines, extract a sub-component
- ❌ No `useState`, `useEffect`, event handlers — if you need those, use `create-client-component`
- ❌ No direct Supabase calls — receive data as props from the parent page

---

## Skill 3: `create-client-component`

**Use when:** Creating a component that needs hooks, event handlers, or browser APIs.

### Template

```typescript
'use client'

// src/components/learn/LevelDetailModal.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Level, LevelMastery } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface LevelDetailModalProps {
  level: Level
  mastery: LevelMastery | undefined
  isOpen: boolean
  onClose: () => void
}

export default function LevelDetailModal({
  level,
  mastery,
  isOpen,
  onClose,
}: LevelDetailModalProps) {
  const router = useRouter()

  function handleStart() {
    onClose()
    router.push(`/learn/${level.worldId}/${level.id}`)
  }

  const bestStars = mastery?.stars ?? 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {level.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {level.description}
        </p>

        {/* Star thresholds */}
        <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex justify-between text-sm">
            <span>★ Bronze</span>
            <span className="font-semibold">{level.star1Score} correct</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>★★ Silver</span>
            <span className="font-semibold">{level.star2Score} correct</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>★★★ Gold</span>
            <span className="font-semibold">{level.targetScore} correct</span>
          </div>
        </div>

        {/* Your best */}
        {mastery && (
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            Your best: {'⭐'.repeat(bestStars)}{'☆'.repeat(3 - bestStars)} — {mastery.bestScore} correct
          </p>
        )}

        <Button
          onClick={handleStart}
          className="w-full h-12 text-base font-bold rounded-xl"
          style={{ backgroundColor: 'var(--pink-300)', boxShadow: 'var(--shadow-btn-primary)' }}
        >
          {mastery ? 'Play Again' : 'Start Level'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

### Rules for create-client-component

- ✅ Always add `'use client'` as the FIRST line
- ✅ Always use `useRouter` from `next/navigation` (NOT `next/router`)
- ✅ Always define typed props interface
- ✅ Use shadcn/ui components (Button, Dialog, Progress, etc.) when applicable
- ✅ Use CSS variables for colors that come from the design system
- ❌ Never fetch from Supabase directly inside this component unless it's a mutation (write). For reads, receive data as props from the Server Component parent.
- ❌ Never use HTML `<form>` tags
- ❌ Never use `window.location`

---

## Skill 4: `create-supabase-hook`

**Use when:** Creating a custom hook for reading or writing data to Supabase from a Client Component.

### Template A — Read Hook (with loading state)

```typescript
// src/hooks/useUserProfile.ts
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/game/types'

interface UseUserProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUserProfile(userId: string | undefined): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchProfile() {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      setError('Failed to load profile')
      console.error(fetchError)
    } else {
      // Map DB snake_case → TS camelCase
      setProfile({
        username: data.username,
        avatarEmoji: data.avatar_emoji,
        xp: data.xp,
        accountLevel: data.account_level,
        dailyStreak: data.daily_streak,
        lastStreakDate: data.last_streak_date,
        dailyXPEarned: data.daily_xp_earned,
        dailyGoalMinutes: data.daily_goal_minutes,
        onboardingComplete: data.onboarding_complete,
        mathLevel: data.math_level,
        createdAt: data.created_at,
      })
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  return { profile, isLoading, error, refetch: fetchProfile }
}
```

### Template B — Mutation Hook (write/update)

```typescript
// src/hooks/useMastery.ts
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SessionResult, Level } from '@/lib/game/types'
import { calculateStars } from '@/lib/game/xp'

interface SaveMasteryResult {
  stars: 0 | 1 | 2 | 3
  isNewBest: boolean
}

interface UseMasteryReturn {
  saveMastery: (userId: string, level: Level, result: SessionResult) => Promise<SaveMasteryResult>
  isSaving: boolean
  saveError: string | null
}

export function useMastery(): UseMasteryReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const supabase = createClient()

  async function saveMastery(
    userId: string,
    level: Level,
    result: SessionResult
  ): Promise<SaveMasteryResult> {
    setIsSaving(true)
    setSaveError(null)

    const newStars = calculateStars(result.correct, level)

    // Fetch existing mastery to compare
    const { data: existing } = await supabase
      .from('level_mastery')
      .select('stars, best_score')
      .eq('user_id', userId)
      .eq('level_id', level.id)
      .maybeSingle()

    const isNewBest = !existing || result.correct > (existing.best_score ?? 0)
    const keptStars = Math.max(newStars, existing?.stars ?? 0) as 0 | 1 | 2 | 3

    // Upsert (insert or update — keep the BEST stats)
    const { error } = await supabase
      .from('level_mastery')
      .upsert({
        user_id: userId,
        level_id: level.id,
        stars: keptStars,
        best_score: Math.max(result.correct, existing?.best_score ?? 0),
        best_accuracy: result.accuracy,
        attempts: (existing?.attempts ?? 0) + 1,
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,level_id'
      })

    if (error) {
      setSaveError('Failed to save your progress')
      console.error(error)
    }

    setIsSaving(false)
    return { stars: newStars, isNewBest }
  }

  return { saveMastery, isSaving, saveError }
}
```

### Rules for create-supabase-hook

- ✅ Always use `createClient` from `@/lib/supabase/client` (browser client)
- ✅ Always include `isLoading` / `isSaving` state for UI feedback
- ✅ Always include `error` state and set it on failure
- ✅ Always expose a `refetch` function on read hooks
- ✅ Map DB snake_case columns → TypeScript camelCase in the hook (keep types.ts clean)
- ✅ Use `maybeSingle()` instead of `single()` when the row might not exist
- ✅ Use `upsert` with `onConflict` for save operations that should not create duplicates
- ❌ Never throw errors from hooks — set `error` state and return
- ❌ Never use `any` type for Supabase data rows — define DB types or map inline

---

## Skill 5: `create-api-route`

**Use when:** Creating a Next.js Route Handler inside `src/app/api/`.

### Template

```typescript
// src/app/api/daily-challenge/route.ts
import { createClient } from '@/lib/supabase/server'
import { generateDailyChallenges } from '@/lib/game/dailyChallenges'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Generate today's challenges (seeded by date — same for all users)
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const challenges = generateDailyChallenges(today)

    // 3. Fetch user's progress for today
    const { data: progress } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_date', today)
      .maybeSingle()

    return NextResponse.json({
      challenges,
      progress: progress ?? null,
      date: today,
    })

  } catch (err) {
    console.error('daily-challenge GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { challengeIndex, completed } = body as {
      challengeIndex: number
      completed: boolean
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert progress
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: user.id,
        challenge_date: today,
        // ... update challenge completion state
      }, { onConflict: 'user_id,challenge_date' })

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('daily-challenge POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Rules for create-api-route

- ✅ Always use `createClient` from `@/lib/supabase/server`
- ✅ Always check auth first — return 401 if not authenticated
- ✅ Always wrap logic in try/catch — return 500 with message on error
- ✅ Always return typed `NextResponse.json()` objects
- ✅ Export one function per HTTP method (`GET`, `POST`, `PATCH`, `DELETE`)
- ❌ Never trust client-provided `userId` — always use `supabase.auth.getUser()` server-side
- ❌ Never put business logic in the route file — use functions from `src/lib/game/`

---

## Skill 6: `create-game-screen`

**Use when:** Creating or modifying the core gameplay screen (`GameScreen.tsx`).

### Architecture

GameScreen is **always a Client Component**. It manages all in-session state locally (no Supabase during gameplay). When the session ends, it hands off the complete `SessionResult` to the parent via `onSessionEnd`.

```typescript
'use client'

// src/components/learn/GameScreen.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Level, SessionResult, QuestionAttempt } from '@/lib/game/types'
import { generateQuestion } from '@/lib/game/generator'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'

interface GameScreenProps {
  level: Level
  onSessionEnd: (result: SessionResult) => void
  onPause?: () => void
}

export default function GameScreen({ level, onSessionEnd, onPause }: GameScreenProps) {
  // ── Session State ──────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState(() => generateQuestion(level.generationParams))
  const [userInput, setUserInput] = useState('')
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [streak, setStreak] = useState(0)
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([])
  const [timeLeft, setTimeLeft] = useState(level.timeLimit ?? null)
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  // ── Refs ───────────────────────────────────────
  const sessionStartRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())

  // ── Timer ──────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      endSession()
      return
    }
    const t = setTimeout(() => setTimeLeft(t => (t ?? 0) - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  // ── End Session ────────────────────────────────
  function endSession() {
    const totalCorrect = correct
    const totalAttempted = correct + wrong
    const result: SessionResult = {
      id: generateId(),
      mode: 'learn',
      levelId: level.id,
      startedAt: new Date(sessionStartRef.current).toISOString(),
      durationMs: Date.now() - sessionStartRef.current,
      attempts,
      correct: totalCorrect,
      wrong,
      accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      xpEarned: 0, // calculated in PostLesson
    }
    onSessionEnd(result)
  }

  // ── Submit Answer ──────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return

    const parsed = parseInt(userInput)
    const isCorrect = parsed === currentQuestion.answer
    const responseMs = Date.now() - questionStartRef.current

    const attempt: QuestionAttempt = {
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: parsed,
      isCorrect,
      responseMs,
      skill: level.generationParams.skill,
      operator: level.generationParams.operators[0],
    }

    setAttempts(prev => [...prev, attempt])

    if (isCorrect) {
      setCorrect(c => c + 1)
      setStreak(s => s + 1)
      setAnswerState('correct')
    } else {
      setWrong(w => w + 1)
      setStreak(0)
      setAnswerState('wrong')
    }

    setUserInput('')
    setTimeout(() => {
      setAnswerState('idle')
      setCurrentQuestion(generateQuestion(level.generationParams))
      questionStartRef.current = Date.now()
    }, isCorrect ? 200 : 800)

    // Check if no-timer level target reached
    if (!level.timeLimit && isCorrect && correct + 1 >= level.targetScore) {
      setTimeout(endSession, 300)
    }
  }, [userInput, currentQuestion, correct, level])

  // ── Numpad Press ───────────────────────────────
  function handleKey(key: string) {
    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key === 'ENTER') {
      handleSubmit()
    } else if (userInput.length < 6) {
      setUserInput(prev => prev + key)
    }
  }

  const NUMPAD_KEYS = ['7','8','9','4','5','6','1','2','3','BACK','0','ENTER']

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {level.title}
        </span>
        {timeLeft !== null && (
          <span
            className={cn('font-mono font-bold text-xl', timeLeft <= 10 && 'text-red-500')}
          >
            {timeLeft}s
          </span>
        )}
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {correct}/{level.targetScore}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={cn(
            'text-display text-center transition-all duration-150',
            answerState === 'correct' && 'text-green-500 animate-spring-pop',
            answerState === 'wrong' && 'animate-shake'
          )}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 10vw, 5rem)', fontWeight: 900 }}
        >
          {currentQuestion.question}
        </div>
      </div>

      {/* Answer Display */}
      <div className="text-center text-3xl font-mono font-bold py-4 min-h-[60px]">
        {userInput || <span style={{ color: 'var(--text-tertiary)' }}>_</span>}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 px-6 pb-8 max-w-xs mx-auto w-full">
        {NUMPAD_KEYS.map(key => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            className={cn(
              'h-14 rounded-xl font-bold text-lg transition-transform active:scale-90',
              key === 'ENTER'
                ? 'bg-pink-300 text-white'
                : key === 'BACK'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100'
            )}
            style={key === 'ENTER' ? {
              backgroundColor: 'var(--pink-300)',
              boxShadow: 'var(--shadow-btn-primary)',
            } : undefined}
          >
            {key === 'BACK' ? '⌫' : key === 'ENTER' ? '✓' : key}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Rules for create-game-screen

- ✅ `onSessionEnd` is the ONLY exit — always call it with a complete `SessionResult`
- ✅ All session state (`correct`, `wrong`, `attempts`) lives in local `useState` — never write to Supabase during gameplay
- ✅ Use `useRef` for timing (not state) — `Date.now()` in refs doesn't cause re-renders
- ✅ Use `useCallback` on `handleSubmit` to prevent stale closure bugs with the timer
- ❌ Never call Supabase inside `GameScreen`
- ❌ Never put XP calculation inside `GameScreen` — do it in `PostLesson`
- ❌ Never use `<form>` — use numpad buttons with `onClick`

---

## Skill 7: `add-type`

**Use when:** Adding a new TypeScript type or interface to the project.

### Rule

**All types live in `src/lib/game/types.ts` and ONLY there.** Never define types inline in component files.

### Process

1. Open `src/lib/game/types.ts`
2. Find the correct section (there are comment headers: `// USER PROGRESS`, `// SESSION TRACKING`, etc.)
3. Add the type in that section
4. Export it
5. Import it in the files that need it using `import type { YourType } from '@/lib/game/types'`

### Example

```typescript
// In src/lib/game/types.ts, under // PRACTICE MODE section:

export interface PracticeConfig {
  mode: 'timeAttack' | 'scoreTarget' | 'zen'
  timeLimit?: number      // seconds, for timeAttack
  scoreTarget?: number    // for scoreTarget
  operators: OperationType[]
  numberRange: [number, number]
}

export interface PersonalBest {
  configKey: string       // JSON.stringify(config) — used as lookup key
  score: number
  accuracy: number
  achievedAt: string
}
```

---

## Skill 8: `add-level-data`

**Use when:** Adding levels to `src/lib/game/levels.ts`.

### Rules

- Always add one full world at a time (50 levels)
- All IDs must be globally unique across all worlds
- World N levels start at ID `(N-1) * 50 + 1` (e.g. World 1 = 1-50, World 2 = 51-100)
- Always verify: `star1Score < star2Score < targetScore`
- Test the world in isolation before adding the next

### Template (one level object)

```typescript
{
  id: 1,                           // globally unique
  worldId: 1,                      // 1-8
  worldName: 'Addition Foundation',
  title: 'Making Pairs to 10',
  description: 'Learn the pairs of numbers that add up to exactly 10.',
  tip: 'The trick: memorise these pairs — 1+9, 2+8, 3+7, 4+6, 5+5. If you know them instantly, everything else in addition gets faster.',
  type: 'intro',                   // intro | standard | boss | bonus | speedrun | review
  targetScore: 8,                  // correct answers for ★★★
  star1Score: 4,                   // correct answers for ★
  star2Score: 6,                   // correct answers for ★★
  timeLimit: undefined,            // undefined = no timer
  generationParams: {
    operators: ['+'],
    numberRange: [1, 9],
    skill: 'makeTen',              // drives generator.ts logic
    fixedOperand: undefined,
    fixedOperandPosition: undefined,
  },
},
```

### Helper functions to include at top of levels.ts

```typescript
// Shorthand: builds a level ID from worldId and local index
export function wid(worldId: number, localIndex: number): number {
  return (worldId - 1) * 50 + localIndex
}

// Get all levels for a specific world (used in pages)
export function getLevelsByWorld(worldId: number): Level[] {
  return LEVELS.filter(l => l.worldId === worldId)
}

// Get a single level by ID
export function getLevelById(id: number): Level | undefined {
  return LEVELS.find(l => l.id === id)
}

// Get next unlocked level for a user
export function getNextLevel(mastery: MasteryMap, worldId: number): Level | undefined {
  const worldLevels = getLevelsByWorld(worldId).sort((a, b) => a.id - b.id)
  return worldLevels.find(l => !mastery[l.id] || mastery[l.id].stars === 0)
}
```

---

*SKILLS.md — SkillSum 2.0 | Add new skills as new patterns are established | April 2026*
