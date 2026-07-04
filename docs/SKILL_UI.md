# SKILL: `ui-component` — SkillSum UI Design System Rules
### Reference this skill every time you build or style ANY component in SkillSum 2.0.
### Cross-platform edition: OpenCode, Gemini, Warp, Codex

---

## How to Invoke This Skill

Add to your prompt:

> "Using the **ui-component** skill, build the [component name]"

The AI must read this file fully before writing any JSX or CSS. Every component built in this project must obey every rule in this document. There are no exceptions.

### Cross-Platform Invocation Contract

Use this wrapper in any assistant:

> "Use SkillSum skill: `ui-component`. Follow `SKILL_UI.md` exactly, apply the design system tokens, and list any deviations required by existing code."

### UI Delivery Contract

Every UI implementation response must include:
1. Component(s) created or changed
2. Design-system rules applied (spacing, radius, color tokens, typography, touch targets)
3. Accessibility checks (labels, contrast intent, reduced motion behavior)
4. Responsive behavior summary (mobile/tablet/desktop)
5. Visual-risk notes (anything likely to drift from the system)

### Non-Negotiable Consistency Rule

- If existing code conflicts with this document, prefer this document for new UI
- If changing old UI would cause large regressions, keep old behavior and mark the debt explicitly
- Never mix arbitrary styling patterns in a single component when token equivalents exist

---

## The Golden Rule

> **SkillSum's aesthetic is "Soft Arcade" — Playful but not childish. Clean but not cold. Rewarding but not overwhelming.**

If what you are building does not feel warm, rounded, and satisfying to tap — stop and fix it before moving on.

---

## Section 1 — Spacing (8px Grid)

Every margin, padding, and gap value MUST come from this scale. Never use arbitrary pixel values.

```css
--space-1:  4px   → Tailwind: p-1, gap-1
--space-2:  8px   → Tailwind: p-2, gap-2
--space-3:  12px  → Tailwind: p-3, gap-3
--space-4:  16px  → Tailwind: p-4, gap-4
--space-5:  20px  → Tailwind: p-5, gap-5
--space-6:  24px  → Tailwind: p-6, gap-6
--space-8:  32px  → Tailwind: p-8, gap-8
--space-10: 40px  → Tailwind: p-10, gap-10
--space-12: 48px  → Tailwind: p-12, gap-12
--space-16: 64px  → Tailwind: p-16, gap-16
```

**✅ Correct:**
```tsx
<div className="flex flex-col gap-4 p-6">   {/* 16px gap, 24px padding */}
```

**❌ Wrong:**
```tsx
<div style={{ gap: '18px', padding: '22px' }}>  {/* Not on the 8px grid */}
```

---

## Section 2 — Border Radius

Every rounded corner MUST use one of these values. Never use arbitrary `rounded-[Xpx]`.

```
--radius-sm:   8px   → Tailwind: rounded-lg     → Small buttons, tags, numpad keys
--radius-md:   14px  → Tailwind: rounded-xl     → Cards, inputs, modals
--radius-lg:   20px  → Tailwind: rounded-2xl    → Large panels, bottom sheets
--radius-xl:   28px  → Tailwind: rounded-3xl    → World cards, large feature cards
--radius-full: 9999px → Tailwind: rounded-full  → Pills, circles, level nodes
```

**✅ Correct:**
```tsx
<div className="rounded-2xl">   {/* Large panel — 20px */}
<button className="rounded-xl"> {/* Card button — 14px */}
<div className="rounded-full">  {/* Level bubble */}
```

**❌ Wrong:**
```tsx
<div className="rounded-[18px]">   {/* Arbitrary — not in design system */}
<div className="rounded">          {/* Too subtle — wrong for this aesthetic */}
```

---

## Section 3 — Colors (MUST Use CSS Variables — Never Hardcode Hex)

### Primary Pink Scale
```
var(--pink-50)  = #fff0f5  — very light backgrounds, hover states
var(--pink-100) = #ffe0ec  — surface backgrounds
var(--pink-200) = #ffb3cc  — borders, dividers
var(--pink-300) = #ff80ab  — PRIMARY: main buttons, active states, accents
var(--pink-400) = #ff5c96  — hover over primary
var(--pink-500) = #e0396e  — darker hover
var(--pink-600) = #c55f85  — button shadow color (pressed state)
```

### Background Colors
```
var(--bg-canvas)  = #fef6f9  — page background (always use this, not white)
var(--bg-card)    = #ffffff  — card/modal backgrounds
var(--bg-surface) = #fdf2f6  — secondary surfaces, tip boxes, info panels
```

### Text Colors
```
var(--text-primary)   = #1a1a2e  — headings, main content
var(--text-secondary) = #6b7280  — descriptions, labels
var(--text-tertiary)  = #9ca3af  — placeholders, metadata
var(--text-on-pink)   = #ffffff  — text on pink/colored backgrounds
```

### Semantic / Game Colors
```
var(--correct) = #4caf50  — correct answer flash, success states
var(--wrong)   = #f44336  — wrong answer flash, error states
var(--streak)  = #ff6b35  — streak flame color
var(--xp-gold) = #ffd700  — XP, coins, gold elements
```

### Star Colors
```
var(--star-gold)   = #ffd700  — 3-star / perfect
var(--star-silver) = #c0c0c0  — 2-star
var(--star-bronze) = #cd7f32  — 1-star
var(--star-empty)  = #e0e0e0  — unearned star slot
```

### World Colors (use for world-specific UI elements)
```
var(--world-1) = #ff8fab  — Addition (Pink)
var(--world-2) = #ff9a3c  — Subtraction (Orange)
var(--world-3) = #26c6b0  — Multiplication (Teal)
var(--world-4) = #9b59d0  — Division (Purple)
var(--world-5) = #ef5350  — Mixed (Red)
var(--world-6) = #42a5f5  — Number Sense (Blue)
var(--world-7) = #f72585  — Speed (Hot Pink)
var(--world-8) = #1a237e  — Elite (Deep Navy)
```

### World Gradient Classes (use on world cards and map headers)
```
.world-1-gradient { background: linear-gradient(135deg, #ff8fab, #ff5c7a); }
.world-2-gradient { background: linear-gradient(135deg, #ff9a3c, #ff6b00); }
.world-3-gradient { background: linear-gradient(135deg, #26c6b0, #00897b); }
.world-4-gradient { background: linear-gradient(135deg, #9b59d0, #6a1b9a); }
.world-5-gradient { background: linear-gradient(135deg, #ef5350, #b71c1c); }
.world-6-gradient { background: linear-gradient(135deg, #42a5f5, #1565c0); }
.world-7-gradient { background: linear-gradient(135deg, #f72585, #c2185b); }
.world-8-gradient { background: linear-gradient(135deg, #534bae, #1a237e); }
```

**✅ Correct:**
```tsx
<div style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
<button style={{ backgroundColor: 'var(--pink-300)' }}>Start</button>
```

**❌ Wrong:**
```tsx
<div style={{ backgroundColor: '#fef6f9' }}>    {/* Hardcoded hex — breaks theming */}
<button className="bg-pink-300">Start</button>  {/* Tailwind pink ≠ design system pink */}
<div style={{ color: '#666' }}>                 {/* Not in design system */}
```

> **IMPORTANT:** Tailwind's `bg-pink-300` is NOT the same as `var(--pink-300)`. Always use CSS variables for design system colors, not Tailwind color classes.

---

## Section 4 — Typography (MUST Use Design System Fonts)

### Font Stack
```css
--font-display: 'Nunito', sans-serif;     → Scores, headings, level numbers, questions
--font-body:    'DM Sans', sans-serif;    → Descriptions, labels, body text
--font-mono:    'JetBrains Mono', mono;   → Timer, stats, result numbers
```

### Type Scale — Which to Use Where

| Use case | CSS class | Size | Font | Weight |
|---|---|---|---|---|
| Question text, big score | `.text-display` | clamp(2.5rem, 8vw, 5rem) | Nunito | 900 |
| Screen titles | `.text-h1` | clamp(1.5rem, 4vw, 2.25rem) | Nunito | 800 |
| Section headers | `.text-h2` | clamp(1.1rem, 3vw, 1.5rem) | Nunito | 700 |
| Body text | `.text-body` | 1rem | DM Sans | 400 |
| Labels, small UI | `.text-label` | 0.75rem, uppercase | DM Sans | 600 |
| Timer, statistics | `.text-stat` | clamp(1.25rem, 3vw, 1.75rem) | JetBrains Mono | 700 |

**✅ Correct:**
```tsx
{/* Question in game screen */}
<div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900 }}>
  {question}
</div>

{/* Timer */}
<span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
  {timeLeft}s
</span>
```

**❌ Wrong:**
```tsx
{/* Wrong font for question */}
<div className="text-5xl font-bold">{question}</div>

{/* Wrong font for timer */}
<span className="text-xl">{timeLeft}s</span>
```

---

## Section 5 — Shadows (The "Pressable Button" Effect)

This project uses **colored bottom-offset shadows** — the signature SkillSum 3D-button look. Every primary button MUST have this.

```css
/* Button shadows */
--shadow-btn-primary: 0 6px 0 #c55f85  → Pink primary buttons
--shadow-btn-success: 0 6px 0 #388e3c  → Success/confirm buttons
--shadow-btn-info:    0 6px 0 #1565c0  → Info/secondary buttons

/* Elevation shadows */
--shadow-sm: 0 2px 0 0 rgba(0,0,0,0.08) → Subtle card lift
--shadow-md: 0 4px 0 0 rgba(0,0,0,0.10) → Cards, inputs
--shadow-lg: 0 6px 0 0 rgba(0,0,0,0.12) → Prominent cards

/* Glows */
--glow-primary: 0 0 20px rgba(255, 128, 171, 0.4) → Pulsing active elements
--glow-gold:    0 0 20px rgba(255, 215, 0, 0.5)    → Stars, XP elements
```

### Primary Button Pattern (ALWAYS use this exact pattern):
```tsx
<button
  className="flex items-center justify-center gap-2 px-8 min-h-[56px] rounded-xl text-white font-bold text-lg transition-all duration-100 active:translate-y-1"
  style={{
    fontFamily: 'var(--font-display)',
    backgroundColor: 'var(--pink-300)',
    boxShadow: 'var(--shadow-btn-primary)',
  }}
  onMouseDown={e => (e.currentTarget.style.boxShadow = '0 2px 0 #c55f85')}
  onMouseUp={e => (e.currentTarget.style.boxShadow = 'var(--shadow-btn-primary)')}
>
  🚀 Start Level!
</button>
```

---

## Section 6 — Component Specs

### 6.1 Primary Button

- **Height:** minimum 56px (touch-safe)
- **Font:** Nunito, 800 weight, 1.1rem
- **Shape:** `rounded-xl` (14px radius)
- **Shadow:** `var(--shadow-btn-primary)` (6px colored, pressed = 2px)
- **Press animation:** `translateY(4px)` on active, shadow shrinks
- **Full-width on mobile** unless inside a horizontal button row

### 6.2 Level Node (World Map Bubble)

```
State           Background              Shadow/Border              Size
──────────────────────────────────────────────────────────────────────
gold (3★)       linear-gradient(gold)   glow-gold shimmer          56px circle
silver/bronze   linear-gradient(blue)   shadow-md                  56px circle
next (current)  var(--pink-300)         glow-primary pulsing       56px circle
unlocked        #e5e7eb (grey)          shadow-sm                  56px circle
locked          #d1d5db (dark grey)     none, opacity: 0.5         56px circle
boss            any of above            yellow border 3px          72px circle (1.3×)
```

Stars display ABOVE the bubble (not inside). Level number centered inside. Level title below.

### 6.3 In-Game Star Progress Bar

Must match this layout exactly:
```
⭐                ⭐               ⭐
 │                │                │
─●────────────────●────────────────●─
[======================================]
 8               12               16
```

- Track: `var(--bg-surface)`, height 10px, `rounded-full`
- Fill: `var(--pink-300)` → transitions smoothly as score increases
- Markers: gold circles at star threshold positions (absolute positioned)
- Stars above markers: grey until threshold crossed → gold with `starEarn` animation when earned
- Numbers below: `var(--text-tertiary)`, `font-mono`, 0.7rem

### 6.4 World Card (World Select)

```tsx
// Full-width card, single column on mobile
<div
  className={cn(
    'relative w-full rounded-3xl overflow-hidden cursor-pointer transition-transform active:scale-95',
    `world-${worldId}-gradient`
  )}
>
  {/* Gradient header section */}
  <div className="p-5 text-white">
    <div className="text-4xl mb-1">{world.icon}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
      World {worldId}
    </div>
    <div className="text-sm opacity-80">{world.name}</div>
  </div>
  {/* Progress section (white background) */}
  <div className="bg-white px-5 py-3">
    <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
      <span>{levelsDone}/50 levels</span>
      <span>⭐×{threeStarCount} ⭐×{twoStarCount} ⭐×{oneStarCount}</span>
    </div>
    {/* Progress bar */}
    <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(levelsDone / 50) * 100}%`, backgroundColor: `var(--world-${worldId})` }}
      />
    </div>
  </div>
  {/* Lock overlay */}
  {isLocked && (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <span className="text-4xl">🔒</span>
    </div>
  )}
</div>
```

### 6.5 Achievement Badge

**Unlocked:**
- White card, `rounded-2xl`, gold border (`2px solid var(--star-gold)`)
- Icon centered (large emoji or SVG)
- Title below, bold Nunito
- Description small, DM Sans
- Date earned at bottom, tertiary text
- `box-shadow: var(--glow-gold)` on the card

**Locked (non-secret):**
- Same card but `opacity: 0.5`, `filter: grayscale(1)`
- Shows title + description but no date
- Lock icon overlay in corner

**Locked (secret):**
- Card shows only `?` icon and `"Keep playing to unlock..."`
- Fully blurred content: `filter: blur(4px)` on the icon area

### 6.6 Gameplay Screen Layout (Critical — Do Not Deviate)

```
┌──────────────── FULL SCREEN ──────────────────┐
│  [minimal top bar: level · timer · score]      │  height: ~48px
│  [star progress bar — full width]              │  height: ~40px
├────────────────────────────────────────────────┤
│                                                │
│                                                │
│             QUESTION (huge, centered)          │  flex-1, centered
│                                                │
│                                                │
├────────────────────────────────────────────────┤
│         [answer display — what user typed]     │  height: ~60px
├────────────────────────────────────────────────┤
│         [3×4 numpad grid — no form tags]       │  height: ~240px
│                                                │
└────────────────────────────────────────────────┘
```

- Background: `var(--bg-canvas)` — NOT white
- Question font: Nunito 900, `clamp(2.5rem, 10vw, 5rem)`
- No sidebar, no nav bar shown during gameplay — full focus mode
- Numpad keys: white with `shadow-sm`, 56px height minimum, `rounded-xl`
- Backspace key: light grey background
- Enter/Submit key: `var(--pink-300)` background, `var(--shadow-btn-primary)`

### 6.7 Bottom Sheet (Level Detail Popup)

- Covers bottom 70% of screen
- Background: `var(--bg-card)` white
- `rounded-3xl` on top-left and top-right corners only
- Drag handle: short grey bar centered at top (`2px × 32px`, `var(--text-tertiary)`)
- Dark overlay behind: `rgba(0,0,0,0.4)` on the rest of the screen
- Animation: slides UP from bottom (`translateY(100%) → translateY(0)`)
- Tap overlay to dismiss (slides back down)

### 6.8 Home Screen Card (Daily Challenge / Continue Learning)

```tsx
<div
  className="rounded-2xl p-4"
  style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
>
  <div className="flex items-center gap-3 mb-3">
    <span className="text-2xl">{icon}</span>
    <div>
      <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>{title}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</div>
    </div>
  </div>
  {/* Content */}
  {children}
  {/* CTA Button */}
  <button className="...">Go →</button>
</div>
```

---

## Section 7 — Animation Rules

### Rule 1 — What Gets Animated

| Event | Animation class | Duration |
|---|---|---|
| Screen / card entering | `animate-fade-up` | 0.4s |
| Button tap / numpad key | `active:scale-95` (Tailwind) | Instant |
| Correct answer (question) | `animate-spring-pop` on score | 0.3s |
| Wrong answer (question) | `animate-shake` on question | 0.5s |
| Star earned | `animate-star-earn` on ⭐ icon | 0.7s |
| XP toast | `animate-xp-float` | 1.2s |
| Level unlock | new node slides in | 0.5s |
| Level map load | path draws with SVG dashoffset | 1.0s |
| Boss node / current node | `animate-pulse-glow` | continuous |
| Gold star on map | `animate-star-shimmer` | continuous |
| Streak flame | `animate-flicker` | continuous |
| Achievement popup | `animate-scale-in` | 0.35s |
| World select cards | staggered `animate-fade-up` | 0.07s stagger |

### Rule 2 — Stagger Lists

Any list of 2+ cards/items MUST stagger their entry animations:

```tsx
{worlds.map((world, index) => (
  <div
    key={world.id}
    className="animate-fade-up"
    style={{ animationDelay: `${index * 0.07}s` }}
  >
    <WorldCard world={world} />
  </div>
))}
```

### Rule 3 — Reduced Motion

Every animated component MUST respect `prefers-reduced-motion`. This is already handled in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Do not add `!important` to animation durations inline — it breaks reduced motion.

### Rule 4 — No Framer Motion in MVP (Phases 0–5)

Use only CSS keyframe classes from `globals.css`. The full animation class list available:

```
animate-fade-up       animate-scale-in      animate-star-earn
animate-spring-pop    animate-shake         animate-float
animate-flicker       animate-pulse-glow    animate-star-shimmer
animate-xp-float      animate-level-up
```

---

## Section 8 — Responsive Layout

### Breakpoints

```
Mobile:  < 640px   → single column, bottom tab nav (if any)
Tablet:  640–1023px → same as mobile layout
Desktop: ≥ 1024px  → fixed left sidebar (260px), main content with margin-left
```

### App Shell Grid

```css
/* Mobile default */
.app-shell {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
}

/* Desktop override */
@media (min-width: 1024px) {
  .app-shell { grid-template-columns: 260px 1fr; }
}
```

### Content Width

Main content should NEVER go full-width on desktop. Constrain to max 640px:

```tsx
<div className="max-w-2xl mx-auto px-4 py-6">
  {children}
</div>
```

### Mobile-First Rules

- All `min-h` and `min-w` on touch targets: **48px minimum**
- `active:scale-95` on all tappable cards and buttons (finger press feedback)
- `-webkit-tap-highlight-color: transparent` (already in globals.css body)
- iOS safe area: `pb-[env(safe-area-inset-bottom)]` on bottom nav / numpad containers
- No hover-only states — always pair with active/focus states for touch

---

## Section 9 — What NOT to Do (UI Don'ts)

| ❌ Don't | ✅ Do instead |
|---|---|
| Use Tailwind color classes like `bg-pink-300` for design system colors | Use `style={{ backgroundColor: 'var(--pink-300)' }}` |
| Use arbitrary Tailwind values like `p-[22px]` | Use the nearest 8px grid value |
| Use `rounded` (4px) or `rounded-sm` — too subtle | Use `rounded-lg` (8px) minimum |
| Use system fonts (Arial, sans-serif) for headings or scores | Use `var(--font-display)` (Nunito) |
| Use `font-weight: 400` on heading text | Use 700-900 for headings |
| Add nav bar or sidebar inside gameplay screen | Gameplay is full-screen focus mode |
| Use white (`#ffffff`) as the page background | Use `var(--bg-canvas)` (#fef6f9) |
| Use `<form>` tags anywhere in game UI | Use `onClick` handlers on buttons |
| Add Framer Motion in MVP phases | Use CSS animation classes only |
| Use `any` type on event handlers | Type them properly: `React.MouseEvent<HTMLButtonElement>` |
| Apply a fixed pixel font size without clamp | Use `clamp()` for heading and display text |
| Skip `active:scale-95` on interactive cards | All tappable surfaces need tactile feedback |
| Use `opacity: 0.3` on locked items | Use `opacity: 0.5` with `grayscale(1)` filter |

---

## Section 10 — Checklist Before Submitting Any UI Component

Run through this before finishing any component:

- [ ] All spacings are on the 8px grid (`space-1` through `space-16`)
- [ ] All border radii use the design system values (`rounded-lg` through `rounded-full`)
- [ ] All colors use CSS variables (`var(--pink-300)`, `var(--bg-canvas)`, etc.) — no hardcoded hex
- [ ] Heading / score text uses Nunito (`var(--font-display)`)
- [ ] Timer / stats text uses JetBrains Mono (`var(--font-mono)`)
- [ ] Primary buttons have the 6px colored bottom shadow (`var(--shadow-btn-primary)`)
- [ ] All touch targets are at minimum 48px tall
- [ ] Cards and buttons have `active:scale-95` or equivalent press feedback
- [ ] Lists of items use staggered animation delays
- [ ] Gameplay screen has NO navigation chrome visible
- [ ] No hardcoded hex colors in JSX or inline styles
- [ ] No Framer Motion imports (in MVP phases)
- [ ] The component looks warm, rounded, and satisfying to tap

---

*SKILL_UI.md — SkillSum 2.0 Design System | Invoke this skill for every UI component | April 2026*
