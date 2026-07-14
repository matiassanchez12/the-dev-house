# Tasks: Landing Hero Trust & Activation Refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 260-360 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Ship the hero trust/activation polish end-to-end | PR 1 | Base = feature branch; includes hero components, landing page wiring, and Vitest coverage |

## Phase 1: Foundation / Props

- [x] 1.1 Update `resources/js/components/landing/hero/types.ts` and `resources/js/components/landing/landing-hero.tsx` so `LandingHero` can receive `user_count` and pass it to `HeroHeadline`.
- [x] 1.2 Update `resources/js/pages/landing.tsx` to pass `user_count` into `LandingHero` without changing controller data contracts.

## Phase 2: Core Hero Implementation

- [x] 2.1 Rework `resources/js/components/landing/hero/hero-headline.tsx` to render a subdued live-count badge above a single `h1` with ambition + self-starting ownership copy.
- [x] 2.2 Strengthen `resources/js/components/landing/hero/hero-cta.tsx` so the primary path is visually dominant, includes an arrow icon, and keeps the secondary project path equally reachable.
- [x] 2.3 Replace the empty shell in `resources/js/components/landing/hero/hero-wordmark.tsx` with a minimalist premium brand-energy element only; no counts, testimonials, or trust claims.
- [x] 2.4 Polish `resources/js/components/landing/hero/hero-background.tsx` and `hero-tech-background.tsx` to deepen atmosphere and tighten mobile orbit spacing without hurting readability.

## Phase 3: Landing Integration

- [x] 3.1 Uncomment and render `LandingStats` in `resources/js/pages/landing.tsx` directly below the hero, passing `user_count`, `project_count`, and `collaboration_count`.
- [x] 3.2 Verify `resources/js/components/landing/landing-hero.tsx` still preserves stagger timing and spacing at 375px-wide and reduced-motion states.

## Phase 4: Testing / Verification

- [x] 4.1 Add `resources/js/components/landing/hero/landing-hero.test.tsx` to cover the live badge, exactly one hero `h1`, both CTA paths, and a non-empty wordmark slot.
- [x] 4.2 Add or update `resources/js/pages/landing.test.tsx` to assert `LandingStats` is present below the hero and receives real counts from page props.
- [x] 4.3 Run `npm run test` (or the project’s equivalent) and verify the new hero and landing page coverage passes.

## Phase 5: Cleanup / Polish

- [x] 5.1 Remove any temporary comments, dead imports, or placeholder markup introduced during the hero refactor.
