# Proposal: Landing Hero Refactor — Modern Code Editor (Minimalist)

## Intent

The current `landing-hero.tsx` (185 lines, single component) mixes atmosphere, terminal typing animation, floating techs, grid background, and CTA rendering into one monolithic component. The implementation has five concrete issues: an inline sub-component (`TerminalTypingEffect`) that re-creates on every render and breaks its own animation state, a `setInterval` that runs forever with no reduced-motion gate or visibility pause, hardcoded color values that bypass the design tokens, ad-hoc CSS keyframes injected via `<style jsx global>`, and a hardcoded 8-item tech array when the domain has `User.techs` and `Project.techs` ready to drive it. The file also ends mid-JSX (truncated at line 201 of the 185-line source). The original "Modern Code Editor" direction featured a central typing terminal; after review we drop the terminal in favour of a more minimalist composition: a monospace wordmark + command line on the left, and a clean tech-grid on the right. This refactor establishes a composable hero architecture, the refined minimalist aesthetic, and accessibility/perf baselines that the rest of the landing can adopt later.

## Scope

### In Scope
- Split `landing-hero.tsx` into 5 focused subcomponents under `resources/js/components/landing/hero/`
- Build a `hero-wordmark` subcomponent: monospace wordmark "The Dev House" + a single static command line (`> devhouse.app` + comment line), no animation, no typing
- Build a `hero-tech-grid` subcomponent: 3×2 grid of 5 techs + 1 "+N" overflow slot, static, no float/bob animation
- Add `usePrefersReducedMotion` and `useInViewOnce` hooks (no more typing-related hooks)
- Move ad-hoc keyframes (`bob`, `bob-slow`, `bob-delayed-*`) into `app.css` `@theme` — only the ones still used by the new entrance stagger
- Define `--font-mono` in `app.css` `@theme` using the system monospace stack (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`) — zero new dependencies
- Add minimal design tokens for the wordmark visual (`--wordmark-fg` derived from `--foreground`, `--wordmark-cursor` derived from `--primary`)
- Accept `techs: Tech[]` prop with fallback to 5 curated defaults (React, Laravel, TypeScript, Python, Node.js)
- Add `prefers-reduced-motion` and `IntersectionObserver` gates for entrance animations only (no continuous animations remain on the new subcomponents)
- Pass real `techs` (or empty fallback) from `LandingController` via Inertia props
- Hero copy stays verbatim — no copy changes

### Out of Scope
- Other landing sections (nav, stats, manifesto, how-it-works, social, projects, features, footer)
- New auth flow or backend authentication changes
- Database schema or migration changes
- A/B testing infrastructure
- New copy variants

## Capabilities

### New Capabilities
- `landing-hero`: Defines the composable hero structure, animation behaviour, accessibility guarantees, and configurable tech-list contract for the landing hero section.

### Modified Capabilities
- `landing-branding`: The "Animated Hero Section" requirement gets a delta — the hero MUST respect `prefers-reduced-motion` and MUST accept a configurable tech list. The previous "floating tech badges SHALL exhibit a subtle bob animation" line is replaced with "a tech grid SHALL render, with entrance fade only" because the bob is gone. No other requirement changes; visual identity and copy stay the same.

## Approach

1. **Composition over monolith**: Each subcomponent owns one concern (`hero-background` for atmosphere, `hero-headline` for copy, `hero-wordmark` for the code-style signature, `hero-tech-grid` for the curated tech list, `hero-cta` for buttons). The root hero composes them. No terminal subcomponent, no typing hook.
2. **Hooks kept minimal**: `usePrefersReducedMotion()` returns a boolean that gates entrance animations. `useInViewOnce(ref)` triggers a single `in-view` flag via `IntersectionObserver` for the entrance stagger. Nothing else.
3. **Design tokens first**: Define `--font-mono` (system stack, zero deps) and the wordmark tokens. Remove the `text-green-400` / `bg-gray-900/80` / `border-gray-700` / pink-tinged gradient with semantic equivalents. This unlocks dark-mode parity and removes the "ad-hoc pink" accent.
4. **Move keyframes to `@theme`**: Keep only the keyframes that the new entrance stagger uses (`fade-in-up`). Hoist them to `app.css` and remove the `<style jsx global>` block entirely.
5. **Configurable techs via Inertia**: `LandingController` passes `techs` (top 5 by usage or curated). `hero-tech-grid` renders the prop, falling back to a 5-item hardcoded set when empty. The 6th slot becomes a "+N" overflow indicator if the prop has more than 5.
6. **Accessibility gates**: All entrance animations get `motion-safe:` Tailwind variants. The wordmark and tech grid are static when `prefers-reduced-motion: reduce` is on. CTAs use `min-h-11`. The wordmark is real text — fully accessible by default.
7. **Strict TDD**: Tests for the two hooks first, then subcomponents with React Testing Library (render assertions), then feature tests for the controller. No hook tests for typing (gone).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/landing/landing-hero.tsx` | Removed | Replaced by hero/ directory |
| `resources/js/components/landing/hero/index.tsx` | New | Composes subcomponents |
| `resources/js/components/landing/hero/hero-background.tsx` | New | Grid + orbs + glow atmosphere |
| `resources/js/components/landing/hero/hero-headline.tsx` | New | Badge + h1 + subtitle (copy) |
| `resources/js/components/landing/hero/hero-wordmark.tsx` | New | Monospace wordmark + static command line |
| `resources/js/components/landing/hero/hero-tech-grid.tsx` | New | Static 3×2 tech grid driven by `techs` prop |
| `resources/js/components/landing/hero/hero-cta.tsx` | New | Primary + secondary CTAs |
| `resources/js/components/landing/hero/hooks/use-prefers-reduced-motion.ts` | New | Reduced-motion gate |
| `resources/js/components/landing/hero/hooks/use-in-view-once.ts` | New | One-shot in-view trigger via IntersectionObserver |
| `resources/css/app.css` | Modified | Add `--font-mono`, hoist `fade-in-up` keyframe, add `bg-grid-modern` utility, define wordmark tokens |
| `resources/js/types/index.ts` | Modified | Extend `LandingPageProps` with `techs: Tech[]` |
| `app/Http/Controllers/LandingController.php` | Modified | Pass `techs` to Inertia view |
| `resources/js/pages/landing.tsx` | Modified | Import from new path, pass `techs` to hero |
| `tests/Feature/LandingHeroTest.php` | New | Feature tests for hero variants |
| `resources/js/components/landing/hero/hooks/__tests__/use-prefers-reduced-motion.test.ts` | New | Vitest hook tests |
| `resources/js/components/landing/hero/hooks/__tests__/use-in-view-once.test.ts` | New | Vitest hook tests with mocked IntersectionObserver |
| `openspec/specs/landing-branding/spec.md` | Modified | Add `prefers-reduced-motion` + `configurable techs` + tech-grid (replaces bob) deltas |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Subcomponents over-fragment; harder to follow than the monolith | Medium | Keep subcomponents co-located in `hero/`; index.tsx remains the single read entry point |
| `useInViewOnce` hook leaks observers in tests | Medium | Use mocked `IntersectionObserver` in tests; `disconnect()` verified in teardown |
| New tokens break other landing sections that use raw `text-green-400` | Low | Audit `rg "text-green-400\|bg-gray-900/80\|border-gray-700"` across `resources/js/components/landing/` before merge |
| Visual regression vs current hero | Medium | Manual screenshot diff (before/after) at desktop, tablet, mobile breakpoints |
| `IntersectionObserver` + `prefers-reduced-motion` combo causes flicker on hydration | Low | Render the reduced-motion variant on first paint; only attach observers on `useEffect` |

## Rollback Plan

1. `git revert` the merge commit — change is additive, no data migration
2. Restore `resources/js/components/landing/landing-hero.tsx` from the previous commit
3. Revert `LandingController` and `LandingPageProps` changes (additive prop, safe to drop)
4. Revert `app.css` token additions (additive, no other file uses the new tokens yet)

## Dependencies

- None new. Uses existing `motion-safe` Tailwind variant, existing `Tech` Eloquent model, existing Inertia pattern.

## Success Criteria

- [ ] `landing-hero.tsx` deleted; all hero logic lives under `resources/js/components/landing/hero/`
- [ ] Zero `<style jsx global>` blocks in the hero
- [ ] Zero hardcoded `text-green-400` / `bg-gray-900/80` / `border-gray-700` in the hero
- [ ] `fade-in-up` keyframe defined exactly once in `app.css`
- [ ] `--font-mono` defined in `app.css` `@theme`
- [ ] Hero renders correctly with `prefers-reduced-motion: reduce` (no entrance animation, no continuous motion)
- [ ] Entrance animations trigger only once when the hero enters the viewport
- [ ] Hero accepts `techs: Tech[]` prop; falls back to 5 curated techs when empty
- [ ] When `techs.length > 5`, the 6th grid slot shows a "+N" overflow indicator
- [ ] Hero copy matches current string verbatim
- [ ] `usePrefersReducedMotion` and `useInViewOnce` hooks have Vitest tests with ≥ 90% coverage
- [ ] `LandingHeroTest` feature test covers authenticated and guest variants
- [ ] `php artisan test` and `npm run build` pass with zero errors
- [ ] `pint` passes
- [ ] Lighthouse accessibility score on `/` ≥ 95 (was baseline before refactor)
