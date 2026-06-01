# Tasks: Landing Branding — "The Dev House"

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600–800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + Landing sections → PR 2: Animations + Auth + Cleanup |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Brand sweep, types, logo, hooks, LandingController, landing sections | PR 1 | Base = main; tests included; standalone reviewable |
| 2 | Animations wiring, guest layout branding, onboarding updates, dead code cleanup, config | PR 2 | Base = main (stacked); depends on PR 1 merged; verification included |

## Phase 1: Foundation (Types, Logo, Hooks, Controller)

- [x] 1.1 Update `resources/js/types/index.ts` — add `LandingPageProps` interface with `user_count`, `project_count`, `collaboration_count` fields
- [x] 1.2 Replace Laravel SVG in `resources/js/components/application-logo.tsx` with geometric house+code-bracket inline SVG; add `variant` prop (`'full'` | `'icon'`, default `'icon'`)
- [x] 1.3 Create `resources/js/hooks/use-in-view.ts` — `useInView({ threshold?, rootMargin?, triggerOnce? })` wrapping IntersectionObserver; unobserves after first trigger
- [x] 1.4 Create `resources/js/hooks/use-count-up.ts` — `useCountUp(target, { duration?, trigger?, decimals? })` using `requestAnimationFrame` loop; returns 0 until trigger is true
- [x] 1.5 Modify `app/Http/Controllers/LandingController.php` — add `User::count()`, `ProjectParticipant::count()` to props alongside existing `project_count`; pass `user_count`, `project_count`, `collaboration_count` to Inertia render
- [ ] 1.6 Write feature test `tests/Feature/LandingControllerTest.php` — assert `GET /` returns 200 with component "landing", props match DB counts, component is NOT "welcome"
- [ ] 1.7 Write unit tests for hooks — `tests/Unit/UseInViewTest.ts` (mock IntersectionObserver) and `tests/Unit/UseCountUpTest.ts` (mock requestAnimationFrame)

## Phase 2: Landing Sections (Nav, Hero, Stats, How It Works, Social, Manifesto)

- [x] 2.1 Create `resources/js/components/landing/landing-nav.tsx` — sticky nav (`position: sticky top-0` + `backdrop-blur-md bg-background/80`); logo left, links center, CTA right
- [x] 2.2 Create `resources/js/components/landing/landing-hero.tsx` — CSS dot-pattern background (`radial-gradient`), floating orbs, staggered fade-in for headline/subtitle/CTA
- [x] 2.3 Create `resources/js/components/landing/landing-stats.tsx` — receives 3 count props; each number animates via `useCountUp` when `useInView` triggers; single-trigger behavior
- [x] 2.4 Create `resources/js/components/landing/landing-how-it-works.tsx` — 3 steps (Discover/Collaborate/Ship) with icons, descriptions, connecting lines on desktop, stacked on mobile
- [x] 2.5 Create `resources/js/components/landing/landing-social.tsx` — avatar stack (overlapping circles) + 2-3 testimonial cards with placeholder quotes
- [x] 2.6 Create `resources/js/components/landing/landing-manifesto.tsx` — brand statement "We believe the best code is written together..." with accent background treatment

## Phase 3: Landing Page Wiring + Animations

- [x] 3.1 Add CSS utilities: `tailwind.config.js` keyframes (`float`, `float-delayed`, `bob`) + `resources/css/app.css` `.dot-pattern` class with radial-gradient
- [x] 3.2 Rewrite `resources/js/pages/landing.tsx` — import all section components, accept `LandingPageProps`, compose: Nav → Hero → Stats → HowItWorks → Social → Manifesto → FeaturedProjects → FeaturesSection → CTASection → Footer
- [x] 3.3 Update footer in `landing.tsx` — `bg-muted`/`bg-card` background, sufficient contrast, "The Dev House" branding, no `href="#"` placeholders
- [x] 3.4 Verify scroll animations — all sections use `useInView` for fade-in-up with staggered child delays; single-trigger via `unobserve()`

## Phase 4: Auth Layout + Onboarding Branding

- [x] 4.1 Modify `resources/js/layouts/guest.tsx` — add tagline "Where developers build together" below logo; add subtle dot-pattern background to container
- [x] 4.2 Update `resources/js/pages/onboarding/index.tsx` — `<Head title>` → "Welcome to The Dev House"
- [x] 4.3 Audit remaining brand references — run `rg -i "dev.?collab"` across `resources/`; update any remaining occurrences to "The Dev House"

## Phase 5: Cleanup + Config

- [x] 5.1 Delete `resources/js/pages/welcome.tsx` — dead Breeze page
- [x] 5.2 Update `routes/web.php` — remove welcome route; confirm `/` routes to `LandingController`
- [x] 5.3 Update `.env.example` — `APP_NAME="The Dev House"`
- [x] 5.4 Update `config/app.php` — fallback name → `'The Dev House'` instead of `'Laravel'`
- [x] 5.5 Run `npm run build` — verify zero errors
- [x] 5.6 Run `php artisan test` — verify all tests pass (existing + new)
