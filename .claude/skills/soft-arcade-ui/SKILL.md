---
name: soft-arcade-ui
description: SkillSum's "Soft Arcade" design system. Use whenever building or styling ANY component, page, or UI element in apps/web — buttons, cards, level nodes, gameplay screens, modals, nav. Also use when reviewing UI code for design-system compliance. Triggers on any UI/styling/component/CSS work in this repo.
---

# Soft Arcade UI — SkillSum Design System

Aesthetic: **playful but not childish, clean but not cold, rewarding but not overwhelming**. Warm, rounded, satisfying to tap. Full reference: `docs/SKILL_UI.md` — this file is the working summary; consult the full doc for component-by-component specs (level nodes, star bars, bottom sheets, world cards).

## Hard rules

1. **Colors only via CSS variables** defined in `apps/web/src/app/globals.css`. Never hex literals in components, never Tailwind color classes (`bg-pink-300` ≠ `var(--pink-300)`).
   - Primary: `--pink-300` (buttons/active), `--pink-400` (hover), `--pink-600` (button shadow)
   - Surfaces: `--bg-canvas` (page, never white), `--bg-card`, `--bg-surface`
   - Text: `--text-primary/secondary/tertiary/on-pink`
   - Game: `--correct --wrong --streak --xp-gold`, stars `--star-gold/silver/bronze/empty`, worlds `--world-1..8` + `.world-N-gradient` classes
2. **Spacing on the 8px grid** — Tailwind `p-1..p-16`, never arbitrary `p-[22px]`.
3. **Radius scale**: `rounded-lg` (numpad keys/tags) · `rounded-xl` (cards/inputs/buttons) · `rounded-2xl` (panels) · `rounded-3xl` (world cards/sheets) · `rounded-full` (pills/level nodes). Never `rounded` or arbitrary.
4. **Fonts**: headings/scores/questions `var(--font-display)` (Nunito 700-900) · body `var(--font-body)` (DM Sans) · timers/stats `var(--font-mono)` (JetBrains Mono). Helper classes exist: `.text-display .text-h1 .text-h2 .text-label .text-stat`.
5. **Pressable buttons**: primary buttons ≥56px tall, `rounded-xl`, `boxShadow: var(--shadow-btn-primary)` (6px colored bottom), `active:translate-y-1`. Use the existing `PrimaryButton` component (`apps/web/src/components/ui/PrimaryButton.tsx`) — do not reinvent.
6. **Touch targets ≥48px**, `active:scale-95` on every tappable card.
7. **Animations: CSS classes only** (no Framer Motion): `animate-fade-up scale-in star-earn spring-pop shake float flicker pulse-glow star-shimmer xp-float level-up slide-up`. Lists of 2+ items stagger with `animationDelay: ${index * 0.07}s`.
8. **Gameplay screen is full-screen focus mode** — no nav chrome. Layout: top bar (48px) → star bar → question (flex-1, Nunito 900 `clamp(2.5rem,10vw,5rem)`) → answer display (60px) → 3×4 numpad. No `<form>` tags in game UI.
9. **Responsive**: mobile bottom nav / desktop 260px sidebar (`AppShell` handles this). Content max-w-2xl centered. iOS safe area on bottom elements.
10. Locked items: `opacity: 0.5` + `grayscale(1)`, never `opacity: 0.3`.

## Pre-submit checklist

- [ ] `grep -n "#[0-9a-fA-F]\{3,6\}" <file>` → only allowed inside globals.css
- [ ] All radii/spacings from the scales above
- [ ] Headings use `var(--font-display)`, stats use `var(--font-mono)`
- [ ] Tappables ≥48px with press feedback
- [ ] New component = one file in `apps/web/src/components/<area>/`, named export
