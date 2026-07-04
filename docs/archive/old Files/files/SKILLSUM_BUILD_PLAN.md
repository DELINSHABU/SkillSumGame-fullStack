# SkillSum 2.0 — Enterprise Build Plan
### Solo Developer × AI-Assisted | Next.js 14 + Supabase | MVP-First Approach

---

## How to Read This Document

This plan is written the way a **senior developer at a product company** would approach a greenfield build. It is:

- **MVP-first** — You ship something working after Phase 1, not after Phase 8
- **Layered** — Each phase builds cleanly on top of the previous one
- **Strict** — Every phase has a clear Definition of Done. Do not start the next phase until every checkbox is ticked.
- **Consistent** — The tech decisions made in Phase 0 never change. Consistency is more important than perfection.

The root cause of your previous broken build was **inconsistency** — mixing routing methods, mixing state patterns, mixing component styles. This plan enforces one way to do everything, every time.

---

## Tech Stack Decision (Final — Do Not Change Mid-Build)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server Components, layouts, routing |
| Language | TypeScript (strict mode) | Catches errors before AI introduces them |
| Database | Supabase (Postgres + Auth) | Auth + DB + Realtime in one |
| ORM / Client | Supabase JS Client (`@supabase/ssr`) | Official, works with App Router |
| Styling | Tailwind CSS v3 + CSS Variables | Design tokens in globals.css |
| UI Components | shadcn/ui (Radix-based) | Accessible, unstyled, customizable |
| Charts | Recharts | Lightweight, React-native |
| Animations | CSS keyframes (no Framer Motion in MVP) | Zero runtime cost, simpler |
| State (global) | React Context + useReducer | No Redux needed at this scale |
| State (server) | Supabase real-time + SWR | Caching + revalidation |
| Deployment | Vercel | Zero config, edge functions |
| AI Model | GPT-oss-120b via OpenCode | Your tooling |

> **Supabase replaces localStorage entirely.** All user progress, XP, stars, sessions — stored in the cloud. This is the only right decision for a product that you want to scale or access from multiple devices.

---

## Folder Structure (Enforced from Day 1 — Never Deviate)

```
skillsum/
├── src/
│   ├── app/                         ← Next.js App Router ONLY
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (app)/                   ← Protected routes (require auth)
│   │   │   ├── layout.tsx           ← App shell: sidebar + bottom nav
│   │   │   ├── page.tsx             ← Home screen
│   │   │   ├── learn/
│   │   │   │   ├── page.tsx         ← World select
│   │   │   │   └── [worldId]/
│   │   │   │       ├── page.tsx     ← World map
│   │   │   │       └── [levelId]/
│   │   │   │           └── page.tsx ← Pre-lesson + gameplay + post-lesson
│   │   │   ├── practice/
│   │   │   │   └── page.tsx         ← Practice configurator + session + results
│   │   │   ├── daily/
│   │   │   │   └── page.tsx         ← Daily challenge hub
│   │   │   └── profile/
│   │   │       └── page.tsx         ← Profile + stats + achievements
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── callback/route.ts ← Supabase Auth callback
│   │   │   └── daily-challenge/
│   │   │       └── route.ts          ← Seeded daily challenge generation
│   │   ├── globals.css
│   │   └── layout.tsx               ← Root layout: fonts, metadata
│   │
│   ├── components/
│   │   ├── learn/
│   │   │   ├── WorldSelectGrid.tsx
│   │   │   ├── WorldMap.tsx
│   │   │   ├── LevelNode.tsx
│   │   │   ├── LevelDetailModal.tsx
│   │   │   ├── PreLesson.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   └── PostLesson.tsx
│   │   ├── practice/
│   │   │   ├── PracticeConfigurator.tsx
│   │   │   ├── PracticeSession.tsx
│   │   │   └── PracticeResults.tsx
│   │   ├── daily/
│   │   │   └── DailyChallengeHub.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── StatsTab.tsx
│   │   │   ├── AchievementsTab.tsx
│   │   │   └── HistoryTab.tsx
│   │   ├── ui/                      ← shadcn/ui generated components live here
│   │   └── shared/
│   │       ├── AppShell.tsx         ← Sidebar + bottom nav wrapper
│   │       ├── StarRow.tsx          ← 3-star display (reused everywhere)
│   │       ├── XPToast.tsx          ← Floating XP notification
│   │       ├── StreakBadge.tsx
│   │       ├── LoadingScreen.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            ← Browser Supabase client (singleton)
│   │   │   ├── server.ts            ← Server Supabase client (cookies)
│   │   │   └── middleware.ts        ← Auth session refresh
│   │   ├── game/
│   │   │   ├── types.ts             ← ALL TypeScript types (single source of truth)
│   │   │   ├── levels.ts            ← 400-level data array (built world by world)
│   │   │   ├── generator.ts         ← Question generation from GenerationParams
│   │   │   ├── xp.ts                ← XP calculation functions
│   │   │   ├── achievements.ts      ← Achievement definitions + unlock checks
│   │   │   ├── weakSpots.ts         ← Weak spot detection algorithm
│   │   │   └── dailyChallenges.ts   ← Daily challenge seeded generation
│   │   └── utils.ts                 ← Generic helpers (cn, formatDate, etc.)
│   │
│   ├── hooks/
│   │   ├── useUserProfile.ts        ← Supabase profile CRUD
│   │   ├── useMastery.ts            ← Supabase level mastery CRUD
│   │   ├── useSession.ts            ← Active session state machine
│   │   ├── useAchievements.ts       ← Achievement checking + unlock
│   │   ├── useSound.ts              ← Audio feedback
│   │   └── useSwipe.ts              ← Mobile swipe gestures
│   │
│   └── middleware.ts                ← Next.js middleware for auth protection
│
├── supabase/
│   ├── migrations/                  ← SQL migration files (version controlled)
│   └── seed.sql                     ← Optional: seed data
│
├── public/
│   ├── sounds/
│   └── manifest.json
│
├── AGENT.md                         ← AI agent rules (always open this first)
├── SKILLS.md                        ← Reusable AI skill instructions
└── .env.local                       ← Supabase keys (never commit)
```

---

## Supabase Database Schema

Run these migrations in order. **Do not modify a table after creating it — add a new migration instead.**

### Migration 001 — User Profiles

```sql
-- Enable Row Level Security
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text not null,
  avatar_emoji text not null default '🧠',
  xp          integer not null default 0,
  account_level integer not null default 1,
  daily_streak integer not null default 0,
  last_streak_date date,
  daily_xp_earned integer not null default 0,
  daily_xp_reset_date date,
  daily_goal_minutes integer not null default 10,
  onboarding_complete boolean not null default false,
  math_level text not null default 'beginner', -- beginner | intermediate | confident
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, avatar_emoji)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'Player'), '🧠');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Migration 002 — Level Mastery

```sql
create table public.level_mastery (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  level_id      integer not null,
  stars         smallint not null default 0 check (stars between 0 and 3),
  best_score    integer not null default 0,
  best_accuracy numeric(5,2) not null default 0,
  attempts      integer not null default 0,
  last_played_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, level_id)
);

alter table public.level_mastery enable row level security;

create policy "Users can manage own mastery"
  on public.level_mastery for all using (auth.uid() = user_id);

create index idx_level_mastery_user on public.level_mastery(user_id);
```

### Migration 003 — Session History

```sql
create table public.sessions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  mode          text not null, -- learn | practice | daily
  level_id      integer,
  practice_config jsonb,
  correct       integer not null default 0,
  wrong         integer not null default 0,
  accuracy      numeric(5,2) not null default 0,
  xp_earned     integer not null default 0,
  duration_ms   integer not null default 0,
  attempts      jsonb not null default '[]', -- QuestionAttempt[]
  started_at    timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Users can manage own sessions"
  on public.sessions for all using (auth.uid() = user_id);

create index idx_sessions_user on public.sessions(user_id, started_at desc);
```

### Migration 004 — Achievements

```sql
create table public.user_achievements (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  achievement_id  text not null,
  unlocked_at     timestamptz not null default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can manage own achievements"
  on public.user_achievements for all using (auth.uid() = user_id);
```

### Migration 005 — Daily Challenges

```sql
create table public.daily_progress (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  challenge_date  date not null default current_date,
  challenges      jsonb not null default '[]', -- DailyChallenge[] with completion state
  completed_all   boolean not null default false,
  xp_rewarded     boolean not null default false,
  unique(user_id, challenge_date)
);

alter table public.daily_progress enable row level security;

create policy "Users can manage own daily progress"
  on public.daily_progress for all using (auth.uid() = user_id);
```

---

## Phases Overview

| Phase | Name | Deliverable | Estimated Sessions |
|---|---|---|---|
| 0 | Foundation | Project runs, auth works, DB connected | 1-2 |
| 1 | Core Shell | App shell, navigation, home screen | 1-2 |
| 2 | Data Layer | All types, World 1 levels, question generator | 1-2 |
| 3 | Learn Mode MVP | Full learn loop for World 1 (play + save stars) | 3-4 |
| 4 | Practice Mode | Full practice loop with personal bests | 2-3 |
| 5 | Engagement Layer | XP, streaks, achievements, profile screen | 2-3 |
| 6 | Daily Challenges | Daily challenge generation and tracking | 1-2 |
| 7 | Polish & Scale | Remaining 7 worlds, animations, PWA, sounds | 4-6 |

---

## Phase 0 — Foundation
**Goal:** Project is scaffolded, connects to Supabase, auth flow works end to end.

### Tasks

- [ ] `npx create-next-app@latest skillsum --typescript --tailwind --app --src-dir`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/ssr @supabase/supabase-js
  npm install recharts
  npm install lucide-react
  npx shadcn@latest init
  npx shadcn@latest add button card dialog progress tabs sheet
  ```
- [ ] Create Supabase project at supabase.com
- [ ] Add `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```
- [ ] Create `src/lib/supabase/client.ts` (browser client)
- [ ] Create `src/lib/supabase/server.ts` (server client with cookies)
- [ ] Create `src/middleware.ts` (session refresh + auth redirect)
- [ ] Run Migration 001 in Supabase SQL editor
- [ ] Create `src/app/(auth)/login/page.tsx` — email/password login form
- [ ] Create `src/app/(auth)/signup/page.tsx` — signup form + create profile
- [ ] Create `src/app/api/auth/callback/route.ts` — Supabase OAuth/email callback
- [ ] Protect all `(app)/` routes in middleware

### Definition of Done ✅

- [ ] `npm run dev` runs with zero errors
- [ ] TypeScript strict mode passes (`npx tsc --noEmit`)
- [ ] Can sign up with email → redirected to `/` (app home)
- [ ] Can log out → redirected to `/login`
- [ ] Supabase `profiles` table has a row for the test user
- [ ] Refreshing page preserves the logged-in session

---

## Phase 1 — App Shell & Navigation
**Goal:** The app has a consistent, navigable shell on both mobile and desktop.

### Tasks

- [ ] Create `src/app/globals.css` — full design tokens from UI Design Plan (CSS variables, fonts, animations, base styles)
- [ ] Create `src/components/shared/AppShell.tsx`:
  - Mobile: fixed bottom tab bar (Home, Learn, Practice, Daily, Profile)
  - Desktop: fixed left sidebar (260px) with same 5 nav items
  - Uses `usePathname()` to highlight active tab
- [ ] Create `src/app/(app)/layout.tsx` — wraps all protected pages in `<AppShell>`
- [ ] Create placeholder pages for all 5 main routes (just render a heading)
- [ ] Create `src/components/shared/LoadingScreen.tsx` — branded loading state
- [ ] Create `src/components/shared/ErrorBoundary.tsx`

### Definition of Done ✅

- [ ] Navigating between all 5 main routes works (no page reloads — uses `<Link>`)
- [ ] Active tab is highlighted correctly on all routes
- [ ] Mobile bottom nav is fully visible and tappable (48px min touch target)
- [ ] Desktop sidebar is visible on screen widths ≥ 1024px
- [ ] No layout shift on page transitions
- [ ] Design tokens from `globals.css` are applied (correct font, background color)

---

## Phase 2 — Data Layer
**Goal:** All game data types and World 1 content exist and are verifiably correct.

### Tasks

- [ ] Create `src/lib/game/types.ts` — all TypeScript interfaces (Level, UserProfile, LevelMastery, QuestionAttempt, SessionResult, PracticeConfig, Achievement, DailyChallenge)
- [ ] Create `src/lib/game/generator.ts` — generates a `{ question: string, answer: number }` from a `GenerationParams` object. Must handle all `SkillType` values.
- [ ] Write unit tests for `generator.ts` (at minimum: one test per SkillType that it generates a valid question and the answer is mathematically correct)
- [ ] Create `src/lib/game/levels.ts` — World 1 only (50 levels). Use the exact structure from the Master Guide. Each level has: `id, worldId, worldName, title, description, tip, type, targetScore, star1Score, star2Score, timeLimit, generationParams`
- [ ] Create `src/lib/game/xp.ts` — `calculateXP(correct, accuracy, streak, isLearnMode): number`
- [ ] Create `src/lib/game/achievements.ts` — all 50 achievement definitions (id, title, description, condition). No unlock logic yet — just the data.
- [ ] Create `src/lib/utils.ts` — `cn()` (clsx + twMerge), `formatDuration()`, `formatDate()`, `generateId()`
- [ ] Run Migrations 002–005 in Supabase

### Definition of Done ✅

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `generator.ts` produces valid questions for all 8 SkillTypes used in World 1
- [ ] `levels.ts` exports exactly 50 levels with `worldId: 1`
- [ ] Every level has `star1Score < star2Score < targetScore`
- [ ] All 5 Supabase tables exist with RLS enabled

---

## Phase 3 — Learn Mode (MVP — World 1 Only)
**Goal:** A user can play Level 1, earn stars, and have that result saved to Supabase. The full learn loop works.

### This phase builds these screens in order:

```
World Select → World Map → Level Detail Modal → Pre-Lesson → Gameplay → Post-Lesson
```

**Build and test each screen before moving to the next.**

### 3A — World Select Screen

- [ ] Create `src/app/(app)/learn/page.tsx`
- [ ] Create `src/components/learn/WorldSelectGrid.tsx`
  - Shows 8 world cards in a 2-column grid
  - Each card: world gradient background, world icon, world name, `X/50 levels` progress bar
  - Worlds 2–8: locked state (grayed out, lock icon) in MVP
  - World 1: fully clickable → navigate to `/learn/1`

**Done when:** World 1 card is clickable and navigates to the world map. Other cards show locked state.

### 3B — World Map Screen

- [ ] Create `src/app/(app)/learn/[worldId]/page.tsx` — fetches mastery data for this world from Supabase
- [ ] Create `src/components/learn/WorldMap.tsx` — receives `levels: Level[]` and `mastery: MasteryMap`
- [ ] Create `src/components/learn/LevelNode.tsx` — single bubble node
  - States: `locked` | `unlocked` | `bronze` | `silver` | `gold`
  - Correct icon/color per state
  - Boss levels (every 10th) are visually larger
  - Tapping unlocked/played nodes opens the Level Detail Modal
- [ ] Winding path connecting all 50 nodes (SVG line, not animated yet)
- [ ] Scroll to current level automatically

**Done when:** All 50 level nodes render. Level 1 is unlocked. All others are locked. Tapping Level 1 opens the modal.

### 3C — Level Detail Modal

- [ ] Create `src/components/learn/LevelDetailModal.tsx`
  - Level title and description
  - Star thresholds: "★ 8 correct | ★★ 12 correct | ★★★ 16 correct"
  - Time limit display (or "No timer" for intro levels)
  - User's best stars and score (from mastery)
  - `[Start Level]` button → navigates to `/learn/1/[levelId]`

**Done when:** Modal shows correct data for Level 1. Start button navigates to gameplay.

### 3D — Pre-Lesson Screen

- [ ] Create `src/app/(app)/learn/[worldId]/[levelId]/page.tsx`
- [ ] Create `src/components/learn/PreLesson.tsx`
  - Shows `level.tip` in a styled tip box
  - Shows the `level.title` as heading
  - "I'm Ready!" button → sets local state to `'playing'`
  - Skip button for replays (if `mastery.attempts > 0`)

**Done when:** Pre-lesson shows for Level 1. "I'm Ready!" transitions to gameplay.

### 3E — Gameplay Screen

- [ ] Create `src/components/learn/GameScreen.tsx`

**Props:**
```typescript
interface GameScreenProps {
  level: Level;
  onSessionEnd: (result: SessionResult) => void;
}
```

**Internals:**
- Uses `generator.ts` to create a question on mount and after each answer
- Top bar: level name | star progress bar | countdown timer (if `level.timeLimit`)
- Center: question text (large, Nunito font)
- Input: custom numpad (0-9, backspace, submit) OR text input
- Streak counter
- Correct answer: brief green flash, next question
- Wrong answer: shake animation, show correct answer briefly, next question
- Session ends when: timer hits 0 OR (no timer) target score reached
- On session end: calls `onSessionEnd(result)` with full `SessionResult`

**Done when:** Can answer 10 questions in Level 1. Session ends. `onSessionEnd` is called with correct data.

### 3F — Post-Lesson Screen

- [ ] Create `src/components/learn/PostLesson.tsx`
- [ ] Create `src/hooks/useMastery.ts` — `saveLevelMastery(userId, levelId, result)`

**PostLesson displays:**
- Stars earned (0-3), animated reveal one by one
- Correct / Wrong / Accuracy %
- XP earned
- [Retry Level] | [Next Level] | [Back to Map] buttons

**On mount:**
1. Calculate stars from `result.correct` vs `level.star1/2/targetScore`
2. Calculate XP via `xp.ts`
3. Save mastery to Supabase (upsert, keep best stars)
4. Update user profile: add XP, check streak

**Done when:** After completing Level 1, stars are saved to Supabase. Navigating to map shows Level 1 as completed and Level 2 as unlocked.

### Phase 3 Definition of Done ✅

- [ ] Full learn loop works: Select World → Map → Detail → Pre-lesson → Play → Results → Map
- [ ] Stars persist in Supabase after page refresh
- [ ] Level 2 unlocks after Level 1 is passed (any stars > 0)
- [ ] Boss level node (L10) is visually distinct
- [ ] Timer counts down correctly and ends session
- [ ] No TypeScript errors

---

## Phase 4 — Practice Mode
**Goal:** Full practice mode loop works with personal best tracking.

### 4A — Practice Configurator

- [ ] Create `src/app/(app)/practice/page.tsx`
- [ ] Create `src/components/practice/PracticeConfigurator.tsx`

**Config options:**
- Mode: `[Time Attack] [Score Target] [Zen]`
- Time (for Time Attack): `[15s] [30s] [60s] [120s]`
- Target (for Score Target): `[10] [25] [50] [100]`
- Operations: `[+] [-] [×] [÷] [All]` (multi-select)
- Range: `[Easy 1-15] [Medium 1-30] [Hard 1-50]`
- Show personal best badge for current config (loads from Supabase sessions)

### 4B — Practice Session

- [ ] Create `src/components/practice/PracticeSession.tsx`

Uses same `GameScreen` internals but:
- No star bar
- Live score + accuracy at top
- No pre-lesson screen
- Ends when: timer hits 0 (Time Attack), score reached (Score Target), or user presses pause (Zen)

### 4C — Practice Results

- [ ] Create `src/components/practice/PracticeResults.tsx`
- [ ] Create performance graph: questions per 10-second block (bar chart, Recharts)
- [ ] Show "New Personal Best! 🎉" banner if this session beats the previous best for this exact config
- [ ] Save session to `sessions` table in Supabase

### Phase 4 Definition of Done ✅

- [ ] All 3 practice modes work
- [ ] Personal bests are saved and displayed correctly
- [ ] Performance graph renders with real session data
- [ ] Session history appears in Supabase `sessions` table

---

## Phase 5 — Engagement Layer
**Goal:** XP, streaks, achievements, and profile screen are all working.

### 5A — XP & Streak System

- [ ] On every `PostLesson` and `PracticeResults` mount:
  - Add XP to profile (`supabase.update profiles set xp = xp + earned`)
  - Recalculate `account_level` from XP thresholds
  - Check `last_streak_date` — if yesterday, increment streak; if today, no change; if older, reset to 1
  - Update `daily_xp_earned` (reset if new day)
- [ ] Create `src/components/shared/XPToast.tsx` — floating "+250 XP" animation
- [ ] Create `src/components/shared/StreakBadge.tsx`

### 5B — Achievement System

- [ ] Create `src/hooks/useAchievements.ts`
  - `checkAchievements(userId, sessionResult, profile, mastery)` → returns array of newly unlocked achievement IDs
  - Inserts newly unlocked achievements into `user_achievements` table
- [ ] Achievement unlock modal — shows when an achievement is earned (shadcn Dialog)
- [ ] Hook into `PostLesson` and `PracticeResults` — call `checkAchievements` after saving session

### 5C — Profile Screen

- [ ] Create `src/app/(app)/profile/page.tsx`
- [ ] Create `src/components/profile/ProfileHeader.tsx` — avatar, username, level badge, XP progress bar to next level, streak display
- [ ] Create `src/components/profile/StatsTab.tsx` — total questions, accuracy, world completion bars
- [ ] Create `src/components/profile/AchievementsTab.tsx` — grid of badges (unlocked + locked blurred)
- [ ] Create `src/components/profile/HistoryTab.tsx` — last 20 sessions from Supabase

### Phase 5 Definition of Done ✅

- [ ] XP increases after every session and persists
- [ ] Account level increases at correct thresholds
- [ ] Streak increments once per calendar day
- [ ] At least 5 achievements can be unlocked and appear on the profile
- [ ] Profile screen shows accurate data

---

## Phase 6 — Daily Challenges
**Goal:** 3 daily challenges are generated, tracked, and reward XP on completion.

### Tasks

- [ ] Create `src/app/api/daily-challenge/route.ts` — GET endpoint that returns today's 3 challenges, seeded by date (same challenges for all users on same day)
- [ ] Create `src/components/daily/DailyChallengeHub.tsx`
  - Shows 3 challenges with progress indicators
  - "Complete all 3 → 2000 XP" reward banner
  - Start buttons for each challenge
- [ ] Track completion in `daily_progress` Supabase table
- [ ] Award XP on completing all 3 (guard against double-awarding with `xp_rewarded` flag)
- [ ] Home screen shows daily challenge card with "2/3 complete" progress

### Phase 6 Definition of Done ✅

- [ ] Daily challenges are deterministic per date (same seed = same challenges)
- [ ] Challenge completion is tracked correctly
- [ ] XP is awarded exactly once per day
- [ ] Home screen shows current day's progress

---

## Phase 7 — Polish, Scale & Remaining Worlds
**Goal:** Production-ready app. All 8 worlds. Animations. Sounds. PWA.

### 7A — Remaining 7 Worlds

- [ ] Add levels for World 2 (Subtraction) to `levels.ts`. Test. Commit.
- [ ] Add levels for World 3 (Multiplication). Test. Commit.
- [ ] Continue for Worlds 4–8.
- [ ] Unlock logic: World N unlocks when the World Boss (Level N×50) of World N-1 has stars > 0.

**Build one world at a time. Never build two worlds in one session.**

### 7B — Animations

- [ ] Star earn animation on PostLesson (CSS keyframes, staggered)
- [ ] World map path draw animation (SVG `stroke-dashoffset`)
- [ ] Level node pulse animation for current unlocked level
- [ ] XP toast float animation
- [ ] Level-up modal animation

### 7C — Sound Effects

- [ ] Create `src/hooks/useSound.ts` with Web Audio API
- [ ] Add sounds: `correct.mp3`, `wrong.mp3`, `star-earn.mp3`, `level-up.mp3`, `streak.mp3`
- [ ] Sound toggle in profile settings

### 7D — PWA & Mobile Polish

- [ ] Update `public/manifest.json` with correct icons and shortcuts
- [ ] `next-pwa` or manual service worker for offline caching
- [ ] iOS safe area insets (`env(safe-area-inset-bottom)` for bottom nav)
- [ ] Prevent zoom on input focus (already in globals.css — verify)
- [ ] Test on real iOS and Android devices

### 7E — Performance

- [ ] `useMemo` on world-filtered level arrays
- [ ] Lazy load `PracticeResults` (has Recharts — heaviest component)
- [ ] Add `loading.tsx` files for all major routes (Next.js streaming)
- [ ] Verify Lighthouse score ≥ 90 on mobile

### Phase 7 Definition of Done ✅

- [ ] All 8 worlds have 50 levels each (400 total)
- [ ] All unlock gates work correctly
- [ ] PWA installable on Android and iOS
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95
- [ ] No console errors in production build

---

## Cross-Phase Rules (Never Break These)

1. **One routing method.** Always `useRouter()` from `next/navigation` and `<Link>` from `next/link`. Never `window.location`. Never `pages/` directory.

2. **One data source.** All persistent data lives in Supabase. Never use `localStorage`. Never use `sessionStorage`. Use React state for ephemeral (in-session) data only.

3. **One pattern for Supabase in Server Components.** Always use `src/lib/supabase/server.ts`. Never create a new Supabase client inline in a component.

4. **One pattern for Supabase in Client Components.** Always use `src/lib/supabase/client.ts` (singleton). Never call `createBrowserClient()` inside a component.

5. **One component per file.** No multi-component files. One default export per file.

6. **Types before code.** If a type doesn't exist in `types.ts`, add it there first. Never use `any`. Never use inline type objects in function signatures.

7. **Build one screen at a time.** Complete and test a screen before starting the next. Never scaffold multiple screens simultaneously.

8. **Commit after each completed phase.** Use `git commit -m "phase-X: [description]"`. If something breaks, you can always roll back.

---

*SkillSum 2.0 Build Plan — Solo Developer × AI-Assisted | April 2026*
