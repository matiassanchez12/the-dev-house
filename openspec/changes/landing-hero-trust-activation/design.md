# Design: Landing Hero Trust & Activation Refactor

## Technical Approach

Implement a conservative frontend-only polish pass inside the existing landing hero module. `landing.tsx` will pass the existing live `user_count` into `LandingHero`, render `LandingStats` immediately after the hero, and keep controller/data contracts unchanged. Hero subcomponents remain co-located under `resources/js/components/landing/hero/`; changes are mostly copy, props, Tailwind treatment, and responsive orbit constants.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Pass `user_count` into `LandingHero` vs derive from `users.length` | `user_count` matches controller count contract and avoids coupling hero to social user cards. | Use `user_count` prop for the badge. |
| Replace `HeroWordmark` in-place vs create a new component | In-place keeps current composition and stagger timing. | Rework `hero-wordmark.tsx` as a brand-energy element. |
| Tune current orbit/background vs redesign animation | Tuning limits risk and respects no-heavy-animation scope. | Adjust constants/classes only; no new animation system. |
| Add focused component tests vs rely only on PHP Inertia tests | UI requirements are DOM/interaction-level. | Add Vitest coverage for hero and landing stats activation. |

## Data Flow

```text
LandingController ── Inertia props ──> landing.tsx
  user_count/project_count/collaboration_count ├─> LandingStats
  user_count/auth/techs                         └─> LandingHero
                                                   ├─> HeroHeadline badge
                                                   ├─> HeroWordmark brand element
                                                   └─> HeroCta dual path
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/pages/landing.tsx` | Modify | Pass `user_count` to `LandingHero`; uncomment `LandingStats` with controller counts. |
| `resources/js/components/landing/landing-hero.tsx` | Modify | Extend props, keep composition, adjust vertical spacing if badge/stats need breathing room. |
| `resources/js/components/landing/hero/types.ts` | Modify | Add `user_count: number` to `LandingHeroProps`; add `userCount` to `HeroHeadline` contract. |
| `resources/js/components/landing/hero/hero-headline.tsx` | Modify | Render subdued live-count badge above the single `h1`; update headline/subtitle copy. |
| `resources/js/components/landing/hero/hero-cta.tsx` | Modify | Strengthen primary CTA, add arrow icon, keep secondary path visible and tappable. |
| `resources/js/components/landing/hero/hero-wordmark.tsx` | Modify | Replace empty shell with minimalist decorative brand-energy visual; no counts/testimonials. |
| `resources/js/components/landing/hero/hero-background.tsx` | Modify | Slightly richer token-based glows while preserving readability and z-order. |
| `resources/js/components/landing/hero/hero-tech-background.tsx` | Modify | Tighten mobile/tablet orbit radii, item count, and center offset to avoid CTA crowding. |
| `resources/js/components/landing/hero/landing-hero.test.tsx` | Create | DOM tests for badge, one h1, CTA labels/touch classes, non-empty wordmark. |
| `resources/js/pages/landing.test.tsx` | Create/Modify | Verify `LandingStats` renders below hero with real props. |

## Interfaces / Contracts

```ts
interface LandingHeroProps {
  auth: { user: { id: number; name: string } | null };
  techs: Tech[];
  user_count: number;
  className?: string;
}

interface HeroHeadlineProps {
  userCount: number;
}
```

Badge formatting should be presentational only, e.g. `+{userCount.toLocaleString()} developers building now`; zero must still render a valid, non-empty badge.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `HeroHeadline`, `HeroCta`, `HeroWordmark` DOM semantics | Vitest + Testing Library; assert one `h1`, live badge text, CTA href labels, non-empty brand content. |
| Integration | Landing page activation of `LandingStats` | Vitest page render with mocked Inertia/Ziggy routes; PHP `LandingPageTest` already covers real counts. |
| Visual/manual | 375px mobile spacing, reduced motion, focus rings | Browser check after implementation; verify orbit does not crowd CTA and links remain ≥44px. |

## Migration / Rollout

No migration required. Rollback is a frontend revert or re-commenting `LandingStats` in `landing.tsx`.

## Open Questions

- [ ] None blocking.
