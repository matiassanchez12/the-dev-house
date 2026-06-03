# Tasks: Landing Hero Refactor — Modern Code Editor (Minimalist)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600-800 |
| 400-line budget risk | High |
| Chained PRs recommended | No (single PR with `size:exception`) |
| Suggested split | Single PR — refactor is highly coupled (subcomponents depend on composer; tests depend on full integration). Splitting would break the review. |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full hero refactor (tokens + hooks + subcomponents + composer + backend + tests + delete old) | PR 1 | Single cohesive refactor; cannot split without breaking the diff |

## Phase 1: Foundations — Tokens and Types

- [x] 1.1 Add to `resources/css/app.css` `@theme inline`: `--font-mono` (system stack), `--wordmark-fg` (derived from `--foreground`), `--wordmark-cursor` (derived from `--primary`)
- [x] 1.2 Add to `resources/css/app.css` `@layer base`: body class for wordmark wrapping if needed (no @apply per v4 rules)
- [x] 1.3 Extend `LandingPageProps` in `resources/js/types/index.ts` with required `techs: Tech[]`
- [x] 1.4 Define `LandingHeroProps`, `HeroWordmarkProps`, `HeroTechGridProps`, `HeroCtaProps` interfaces in `resources/js/components/landing/hero/types.ts`

## Phase 2: Reusable Hooks

- [x] 2.1 Create `resources/js/components/landing/hero/hooks/use-prefers-reduced-motion.ts` — listens to `matchMedia('(prefers-reduced-motion: reduce)').change`, returns boolean, cleans up listener on unmount
- [x] 2.2 Create `resources/js/components/landing/hero/hooks/use-in-view-once.ts` — single `IntersectionObserver` per ref, returns `[ref, inView]`, calls `observer.disconnect()` after first intersection

## Phase 3: Subcomponents (no cross-deps)

- [x] 3.1 Create `hero-background.tsx` — grid layer with `bg-grid-modern` utility + primary glow orb + wordmark-cursor gradient, all tokens only, opacity ≤ 0.10
- [x] 3.2 Create `hero-headline.tsx` — `<Badge>`, `<h1>` with locked copy + `<span class="text-primary">` on second line, `<p>` subtitle
- [x] 3.3 Create `hero-wordmark.tsx` — monospace wordmark (font-mono, font-bold) + static `> devhouse.app` command line (color `--wordmark-cursor`) + comment line at opacity 0.6
- [x] 3.4 Create `hero-tech-grid.tsx` — 3×2 grid that renders `techs` prop, falls back to 5 curated (React, Laravel, TypeScript, Python, Node.js) when empty, shows "+N" overflow slot when `length > 5`
- [x] 3.5 Create `hero-cta.tsx` — primary `<Link>` (route: `projects.create` or `register` based on auth) + secondary `<Link>` (route: `projects.index`), both with `min-h-11` and `focus-visible:ring-2`

## Phase 4: Composer

- [x] 4.1 Create `hero/index.tsx` — composes the 5 subcomponents in order, owns `useInViewOnce` on the root `<section>`, applies `motion-safe:animate-fade-in-up` with staggered `--stagger-delay` (80ms steps) on each direct child, `<section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">`

## Phase 5: Backend Wiring

- [x] 5.1 Add to `app/Http/Controllers/LandingController.php`: private `const CURATED_TECHS = ['React', 'Laravel', 'TypeScript', 'Python', 'Node.js']`; if `Tech::count() === 0` return empty `[]` (grid falls back), else return `Tech::orderBy('name')->take(5)->get()->toArray()`
- [x] 5.2 Update `app/Http/Controllers/LandingController.php::index()` to pass `techs` to Inertia payload
- [x] 5.3 Update `resources/js/pages/landing.tsx` to import `LandingHero` from `@/components/landing/hero` and pass `techs` prop

## Phase 6: Tests (PHPUnit + Inertia::testing)

- [x] 6.1 Add `test_landing_page_passes_techs_prop` to `tests/Feature/LandingPageTest.php` — seed 3 `Tech` rows, assert `->has('techs', 3)` and `->where('techs.0.name', 'Aaa...')`
- [x] 6.2 Add `test_landing_page_falls_back_when_techs_empty` — empty `techs` table, assert `->has('techs', 0)` and the grid component renders the 5 curated names
- [x] 6.3 Add `test_landing_hero_has_exactly_one_h1` — assert `assertSee('<h1', false)` count is 1 in the hero region
- [x] 6.4 Add `test_landing_hero_does_not_contain_legacy_artefacts` — `assertDontSee('TerminalTypingEffect')`, `assertDontSee('animate-bob')`, `assertDontSee('text-green-400')`, `assertDontSee('bg-gray-900/80')`
- [x] 6.5 Add `test_landing_hero_uses_design_tokens` — assert rendered HTML uses `font-mono` class and `--wordmark-cursor` resolved token, no inline `style="color: green"`
- [x] 6.6 Add `test_tech_grid_overflow_slot` — seed 7 `Tech` rows, assert rendered grid has 5 cards and a `+2` slot

## Phase 7: Delete Old + Verify

- [x] 7.1 Delete `resources/js/components/landing/landing-hero.tsx`
- [ ] 7.2 Run `php artisan test` and confirm all existing + new tests pass
- [x] 7.3 Run `npm run build` and confirm no TS or Vite errors
- [x] 7.4 Run `vendor/bin/pint` and confirm formatting clean
- [ ] 7.5 Manual visual check at 1440px, 768px, 375px viewports; confirm grid layout, wordmark position, tech grid placement
- [ ] 7.6 Manual toggle of `prefers-reduced-motion: reduce` in DevTools; confirm no entrance animation plays
