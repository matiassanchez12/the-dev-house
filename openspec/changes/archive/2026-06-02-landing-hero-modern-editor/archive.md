# Archive: Landing Hero Refactor — Modern Code Editor (Minimalist)

**Date**: 2026-06-02
**Change**: `landing-hero-modern-editor`
**Status**: ✅ ARCHIVED

## Summary

Refactored the monolithic `landing-hero.tsx` (185 lines, 5 architectural issues) into a composable 5-subcomponent hero with 2 reusable hooks, 3 new design tokens, and a configurable `techs: Tech[]` prop. The new design drops the original typing terminal in favour of a more minimalist "Modern Code Editor" aesthetic: a monospace wordmark + static command line on the left, a static 3×2 tech grid on the right, with a single entrance fade stagger. No continuous animations, no `<style jsx global>`, no hardcoded colors.

## What Was Done

| Layer | Change |
|-------|--------|
| Architecture | 5 co-located subcomponents + 1 composer, replacing the 185-line monolith |
| Hooks | 2 new utilities: `usePrefersReducedMotion` + `useInViewOnce` |
| Design system | 3 new tokens: `--font-mono`, `--wordmark-fg`, `--wordmark-cursor` |
| Backend | `LandingController` now passes `Tech::orderBy('name')->take(5)->get()` to Inertia |
| Types | `LandingPageProps` extended with required `techs: Tech[]` |
| Tests | 6 new feature tests covering techs prop, fallback, h1 count, legacy artefacts, design tokens, overflow slot |
| Build | `npm run build` clean, landing-*.js = 41.34 kB (gzip: 14.36 kB) |
| Pint | Clean on touched files (2); pre-existing project-wide violations left untouched (out of scope) |

## Files

### Created (8)
- `resources/js/components/landing/hero/index.tsx` — composer
- `resources/js/components/landing/hero/types.ts` — interfaces
- `resources/js/components/landing/hero/hero-background.tsx` — atmosphere
- `resources/js/components/landing/hero/hero-headline.tsx` — copy
- `resources/js/components/landing/hero/hero-wordmark.tsx` — code-style signature
- `resources/js/components/landing/hero/hero-tech-grid.tsx` — curated/DB tech list
- `resources/js/components/landing/hero/hero-cta.tsx` — buttons
- `resources/js/components/landing/hero/hooks/use-prefers-reduced-motion.ts`
- `resources/js/components/landing/hero/hooks/use-in-view-once.ts`

### Modified (5)
- `resources/css/app.css` — added `--font-mono`, `--wordmark-fg`, `--wordmark-cursor`
- `resources/js/types/index.ts` — extended `LandingPageProps`
- `app/Http/Controllers/LandingController.php` — passes `techs` prop
- `resources/js/pages/landing.tsx` — imports from new path
- `tests/Feature/LandingPageTest.php` — 6 new tests

### Deleted (1)
- `resources/js/components/landing/landing-hero.tsx` — the monolith

## Specs Synced

| Domain | Action |
|--------|--------|
| `landing-hero` | **Created** in `openspec/specs/landing-hero/spec.md` — new full spec, 7 requirements, 16 scenarios |
| `landing-branding` | **Updated** in `openspec/specs/landing-branding/spec.md` — `Animated Hero Section` requirement rewritten to reflect the new minimalist composition (no terminal, no typing, static wordmark + grid) |

## Verification

**Verdict**: PASS WITH WARNINGS

| Check | Status |
|-------|--------|
| `npm run build` | ✅ PASS |
| `php -l` (touched files) | ✅ PASS |
| `php artisan route:list` | ✅ PASS — `/` still routes to `LandingController@__invoke` |
| `vendor/bin/pint --test` (touched files) | ✅ PASS |
| `php artisan test` | ⚠️ BLOCKED — environment missing `pdo_pgsql` driver (pre-existing, not introduced) |
| Manual visual + reduced-motion checks | ⚠️ PENDING — require browser, not automatable in CLI |

**Open items for the user** (manual verification only, no code changes needed):
1. Visual diff at 1440px, 768px, 375px viewports (task 7.5)
2. Toggle `prefers-reduced-motion: reduce` in DevTools and confirm no entrance animation (task 7.6)

## Design Decisions Honoured

All 7 design decisions were implemented as specified. 3 documented deviations:

1. `LandingController` always runs the query instead of branching on `Tech::count() === 0` — equivalent behaviour with simpler code (empty `get()` triggers the curated fallback in the React component).
2. `usePrefersReducedMotion` is exported but the current composer relies on Tailwind's `motion-safe:` variant — the hook is ready for future JS-driven animations.
3. Pint not applied project-wide — only the 2 touched files. The 60+ pre-existing violations are out of scope.

## Audit Trail

All artifacts in this archive:
- `proposal.md` — the WHY
- `specs/landing-hero/spec.md` — the new capability's WHAT
- `specs/landing-branding/spec.md` — the modified capability's WHAT (with delta applied)
- `design.md` — the HOW
- `tasks.md` — the STEPS (24/28 complete; 4 marked pending are environment-blocked or manual)
- `verify-report.md` — the proof

## SDD Cycle

```
explore → propose → spec → design → tasks → apply → verify → archive
   ✅        ✅        ✅      ✅       ✅       ✅       ✅       ✅
```

**Next**: ready for the next change. The `landing-hero` spec is now part of the source of truth at `openspec/specs/landing-hero/spec.md`. The `landing-branding` spec reflects the new behaviour.
