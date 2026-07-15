# Tasks: Landing Hero–Stats Visual Continuity

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 40–80 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Hero/stats visual continuity polish | PR 1 | Base on `development`; keep CSS + component updates + verification together |

## Phase 1: Theme Animation Foundation

- [x] 1.1 Add `--animate-float-slow` and `@keyframes float-slow` to `resources/css/app.css` beside the existing float tokens.
- [x] 1.2 Keep the slow motion token Tailwind-safe and ready for `motion-reduce:animate-none` usage in the hero layer.

## Phase 2: Hero Background Update

- [x] 2.1 Update `resources/js/components/landing/hero/hero-background.tsx` so the lower glow extends below the hero boundary with a negative bottom offset.
- [x] 2.2 Apply `animate-float-slow motion-reduce:animate-none` only to the lower blob; leave the top blob static.

## Phase 3: Stats Edge Softening

- [x] 3.1 Update `resources/js/components/landing/landing-stats.tsx` to add a non-interactive top gradient overlay that blends into `bg-primary-soft`.
- [x] 3.2 Adjust top padding only as needed so the overlay does not collide with the stats content at 320px–1440px.

## Phase 4: Verification

- [x] 4.1 Verify the hero glow visibly overlaps the stats section in desktop and mobile renders, with no hard seam.
- [x] 4.2 Verify `prefers-reduced-motion: reduce` keeps the overlap visible but disables float animation.
- [x] 4.3 Run the existing landing page test path and frontend build to confirm counts still render and Tailwind compiles.

## Phase 5: Cleanup

- [x] 5.1 Remove any temporary debug classes or spacing tweaks that are not required for the final overlap.
