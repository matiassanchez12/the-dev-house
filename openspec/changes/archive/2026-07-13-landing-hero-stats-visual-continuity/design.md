# Design: Landing Hero–Stats Visual Continuity

## Technical Approach

Implement the change as localized visual polish across the existing landing hero, stats section, and Tailwind v4 theme CSS. The hero already allows vertical overflow (`overflow-x-hidden overflow-y-visible`), so the lower atmospheric glow can bleed below the hero without changing section structure. The stats section will receive that bleed through a top overlay that softens the transition while preserving current count-up behavior and database-driven values.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|-------------------------|-----------|
| Bridge sections visually, not structurally | Keep hero and stats as separate sections; use glow overlap + stats overlay. | Wrap both sections in a shared background container. | Meets the spec without layout rewiring and keeps rollback limited to three files. |
| Animate only the lower glow | Apply `animate-float-slow motion-reduce:animate-none` to the bottom blob only. | Animate both blobs or the full background. | Subtle motion supports polish without competing with the hero wordmark or CTAs. |
| Define animation in theme CSS | Add `--animate-float-slow` and `@keyframes float-slow` in `resources/css/app.css`. | Inline styles or component-local CSS. | Matches existing Tailwind v4 animation tokens (`--animate-float`, `--animate-bob`) and keeps class usage simple. |
| Blend stats with an overlay | Add an absolute top gradient layer inside `LandingStats`. | Change `bg-primary-soft` itself. | Avoids affecting other users of `.bg-primary-soft` and keeps the visual fix scoped. |

## Data Flow

No data flow changes. Existing Inertia props and count-up hooks remain untouched.

```text
Landing page props ──→ LandingStats ──→ useInView/useCountUp
                             │
                             └── visual overlay only

LandingHero ──→ HeroBackground ──→ lower glow overlaps stats edge
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/landing/hero/hero-background.tsx` | Modify | Move the lower glow to a negative bottom offset, increase vertical reach responsively, and add slow motion-safe float with reduced-motion fallback. |
| `resources/js/components/landing/landing-stats.tsx` | Modify | Add a non-interactive top gradient overlay above the dots background and slightly increase top padding if needed to avoid content collision. Preserve refs, stats mapping, and count-up logic. |
| `resources/css/app.css` | Modify | Add `--animate-float-slow: float-slow 10s ease-in-out infinite;` near existing animation tokens and define `@keyframes float-slow` with about `-10px` vertical amplitude. |

## Interfaces / Contracts

No public API, prop, route, database, or service contract changes.

Implementation contract:

- `HeroBackground` remains decorative with `aria-hidden="true"` and `pointer-events-none`.
- Reduced motion MUST disable the ambient float via Tailwind `motion-reduce:animate-none`.
- `LandingStats` MUST keep its existing `LandingStatsProps`, `useInView`, and `useCountUp` behavior.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit / component | Hero background includes the lower glow bridge and reduced-motion-safe animation class. | Add or extend a small React/Vitest test for `HeroBackground` if practical; otherwise verify through the parent render plus class assertions only where stable. |
| Feature | Landing page data still returns real stats and zero-count states. | Run existing `tests/Feature/LandingPageTest.php`; no backend assertions need to change. |
| Visual / manual | Hero-to-stats seam, motion subtlety, mobile spacing, reduced-motion behavior. | Inspect 320px, tablet, and desktop widths; emulate `prefers-reduced-motion: reduce`. |
| Build | Tailwind class/theme integration compiles. | Run `npm run build` after implementation. |

## Migration / Rollout

No migration required. The rollout is a localized frontend/CSS change with no new dependencies or data changes.

## Open Questions

None.
