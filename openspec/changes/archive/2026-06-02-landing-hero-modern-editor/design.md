# Design: Landing Hero Refactor — Modern Code Editor (Minimalist)

## Technical Approach

Replace the monolithic `landing-hero.tsx` with five co-located subcomponents (`hero-background`, `hero-headline`, `hero-wordmark`, `hero-tech-grid`, `hero-cta`) composed by a thin `hero/index.tsx`. Extract two reusable hooks (`usePrefersReducedMotion`, `useInViewOnce`) for accessibility gating, add three design tokens (`--font-mono`, `--wordmark-fg`, `--wordmark-cursor`) to `app.css`, and route a new `techs: Tech[]` prop from the `LandingController` through Inertia. The visual signature is a monospace wordmark + static command line on the left and a static 3×2 tech grid on the right. No terminal subcomponent, no typing effect, no continuous animation. Hero copy is locked verbatim.

Maps to spec requirements: Composable Hero Structure (§1), Hero Headline Copy (§2), Wordmark Visual (§3), Configurable Tech Grid (§4), Atmospheric Background (§5), Accessibility Guarantees (§6), Backend Wiring (§7); plus the modified `landing-branding` "Animated Hero Section" requirement.

## Architecture Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|----------|-----------|
| Hero architecture | 5 subcomponents + 1 root composer | Boolean props on a single component | Boolean-prop proliferation hides intent and reproduces the monolith's coupling issues |
| Hooks | `usePrefersReducedMotion` + `useInViewOnce` as separate utilities | Compound context provider | The codebase has no existing context-providers for hero; two hooks stay composable and test-friendly |
| `useInViewOnce` | `IntersectionObserver` + `disconnect()` after first hit | `useInView` from `react-intersection-observer` | Project has no intersection-observer dep yet; we keep zero new deps by inlining ~20 lines |
| Font for wordmark | System stack via `--font-mono` (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`) | Add `@fontsource-variable/geist-mono` | Zero new deps; native OS monospace is high-quality on every modern OS; aligns with the minimalist direction |
| Tech grid overflow | Static 3×2 grid with a 6th "+N" slot when `techs.length > 5` | Grow the grid to 4×2 | Preserves the curated aesthetic; "+N" is a common pattern (GitHub repo lists) and stays a11y-friendly |
| `--wordmark-cursor` | New token derived from `--primary` | Reuse `--code-prompt` from old terminal tokens | Terminal tokens are gone; wordmark gets its own minimal set (only `fg` and `cursor`) |
| Testing infra | PHPUnit + Inertia::testing assertions on the rendered HTML | Vitest + React Testing Library for unit tests | The project has no vitest config; introducing a new runner is out of scope. Behaviour is fully observable via Inertia props + DOM assertions. Documented in Open Questions. |

## Data Flow

```
LandingController::index()
        │
        │  $techs = Tech::orderByUsage()->take(5)->get() ?: self::CURATED_TECHS
        │  → Inertia::render('landing', [..., 'techs' => $techs])
        ▼
landing.tsx (Inertia page)
        │
        │  <LandingHero auth={auth} techs={techs} />
        ▼
hero/index.tsx (composer)
        │
        ├── <hero-background />          ← atmosphere (pure presentational)
        ├── <hero-headline />            ← copy verbatim
        ├── <hero-wordmark />            ← uses --font-mono, --wordmark-cursor
        ├── <hero-tech-grid techs={techs} />   ← fallback to curated 5 if empty
        ├── <hero-cta auth={auth} />
        │
        └── useInViewOnce(rootRef) ─→ adds 'in-view' class once
            usePrefersReducedMotion() ─→ gates entrance animation class
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/landing/landing-hero.tsx` | Delete | Replaced by `hero/` directory |
| `resources/js/components/landing/hero/index.tsx` | Create | Root composer, owns the `useInViewOnce` trigger and the entrance-class composition |
| `resources/js/components/landing/hero/hero-background.tsx` | Create | Grid + orb + glow using `--primary` / `--muted-foreground` tokens only |
| `resources/js/components/landing/hero/hero-headline.tsx` | Create | Badge + `<h1>` + subtitle (locked copy) |
| `resources/js/components/landing/hero/hero-wordmark.tsx` | Create | Monospace wordmark + static command line, no animation |
| `resources/js/components/landing/hero/hero-tech-grid.tsx` | Create | 3×2 grid with prop fallback and "+N" overflow slot |
| `resources/js/components/landing/hero/hero-cta.tsx` | Create | Primary + secondary buttons, `min-h-11`, focus-visible ring |
| `resources/js/components/landing/hero/hooks/use-prefers-reduced-motion.ts` | Create | Listens to `(prefers-reduced-motion: reduce)` change events |
| `resources/js/components/landing/hero/hooks/use-in-view-once.ts` | Create | One-shot `IntersectionObserver`; returns `inView: boolean` |
| `resources/css/app.css` | Modify | Add `--font-mono`, `--wordmark-fg`, `--wordmark-cursor`; hoist `fade-in-up` keyframe; add `bg-grid-modern` utility |
| `resources/js/types/index.ts` | Modify | Extend `LandingPageProps` with required `techs: Tech[]` |
| `app/Http/Controllers/LandingController.php` | Modify | Pass `techs` to the Inertia view; `CURATED_TECHS` constant for fallback at the data layer |
| `resources/js/pages/landing.tsx` | Modify | Import from `landing/hero`, pass `techs` prop |
| `tests/Feature/LandingPageTest.php` | Modify | Add `test_landing_page_passes_techs_prop` and `test_landing_hero_uses_fallback_when_techs_empty` |
| `openspec/changes/landing-hero-modern-editor/specs/landing-hero/spec.md` | Create (already done) | New full spec |
| `openspec/changes/landing-hero-modern-editor/specs/landing-branding/spec.md` | Create (already done) | Modified spec with delta applied |

## Interfaces / Contracts

```typescript
// resources/js/components/landing/hero/index.tsx
interface LandingHeroProps {
    auth: { user: { id: number; name: string; email: string } | null };
    techs: Tech[];                       // non-empty array (controller guarantees fallback)
    className?: string;
}

// resources/js/components/landing/hero/hero-tech-grid.tsx
interface HeroTechGridProps {
    techs: Tech[];                       // 0..n; renders 5 cards + 1 overflow slot if >5
}

// resources/js/components/landing/hero/hero-cta.tsx
interface HeroCtaProps {
    auth: { user: { id: number } | null };
}

// resources/js/components/landing/hero/hooks/use-prefers-reduced-motion.ts
function usePrefersReducedMotion(): boolean;

// resources/js/components/landing/hero/hooks/use-in-view-once.ts
function useInViewOnce<T extends Element>(
    options?: { rootMargin?: string; threshold?: number }
): [React.RefObject<T>, boolean];

// resources/js/types/index.ts (delta)
interface LandingPageProps {
    user_count: number;
    project_count: number;
    collaboration_count: number;
    techs: Tech[];                       // ← NEW (required)
}
```

## Component Structure

```
LandingHero (root)
├── section (relative, overflow-hidden, pt-32 pb-20 md:pt-40 md:pb-32)
│   ├── hero-background
│   │   ├── grid layer (bg-grid-modern, radial mask, opacity 0.06–0.10)
│   │   ├── glow orbs (bg-primary/5 + bg-primary/8, blur-3xl, position absolute)
│   │   └── pink-tinted gradient (REPLACED by --wordmark-cursor gradient, opacity ≤ 0.05)
│   ├── container (mx-auto px-4 relative z-10)
│   │   ├── hero-headline
│   │   │   ├── Badge ("Donde los desarrolladores construyen juntos")
│   │   │   ├── h1 (font-heading, locked copy, second line in text-primary)
│   │   │   └── p (subtitle, text-muted-foreground)
│   │   ├── hero-wordmark
│   │   │   ├── span (font-mono, "The Dev House", font-bold)
│   │   │   ├── code line (font-mono, color --wordmark-cursor, "> devhouse.app")
│   │   │   └── comment line (font-mono, opacity-60, "// donde los devs construyen juntos")
│   │   ├── hero-tech-grid
│   │   │   └── grid (3 cols × 2 rows on md+, 2 cols on mobile)
│   │   │       ├── TechCard × 5 (or fewer)
│   │   │       └── OverflowCard ("+N") when techs.length > 5
│   │   └── hero-cta
│   │       ├── Primary Link (route: projects.create | register, min-h-11)
│   │       └── Secondary Link (route: projects.index, min-h-11)
```

Entrance animation contract: `useInViewOnce` flips a single `inView` class on the root `<section>`. Tailwind `motion-safe:animate-fade-in-up` with `style={{ animationDelay: '${i * 80}ms' }}` per direct child handles the stagger. `usePrefersReducedMotion` flips an `isReduced` flag; the root applies `motion-safe:` on the animation classes, so the variant vanishes when reduced motion is on (no JS branch needed).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Feature | Landing returns 200 with `landing` component | Extend `LandingPageTest::test_landing_page_returns_successful_response` (already passes) |
| Feature | Controller passes real `techs` from DB | Add `test_landing_page_passes_techs_prop` with 3 seeded `Tech` rows, assert `->has('techs', 3)` and `->where('techs.0.name', ...)` |
| Feature | Controller falls back to curated 5 when DB has no techs | New test: empty `techs` table, assert `->has('techs', 5)` and `->where('techs.0.name', 'React')` |
| Feature | Hero copy is verbatim | Assert rendered HTML contains the exact headline string and the second-line `<span class="text-primary">` wrapper |
| Feature | Hero has exactly one `<h1>` | Assert `assertSee('<h1', false)` count is 1 within the hero section |
| Feature | Hero does not contain legacy artefacts | Assert `assertDontSee('TerminalTypingEffect')`, `assertDontSee('animate-bob')`, `assertDontSee('text-green-400')` |
| Feature | Tech grid renders 5 cards when `techs.length === 5` | Seed 5 techs, assert the rendered grid has 5 card containers and no "+N" slot |
| Feature | Tech grid renders "+N" overflow when `techs.length > 5` | Seed 7 techs, assert a "+2" slot is present and only 5 tech cards are rendered |
| Feature | CTAs meet 44px touch target | Assert primary button has class `min-h-11` and the rendered `<a>` height resolves to ≥ 44px via DOM check |
| Manual | `prefers-reduced-motion: reduce` suppresses animation | Toggle OS preference → reload → confirm no entrance fade plays |
| Manual | Visual diff vs pre-refactor hero | Screenshot at 1440px, 768px, 375px; confirm grid layout, wordmark position, tech grid placement |

## Migration / Rollout

No data migration. The change is additive at the data layer (new `techs` prop) and the CSS layer (new tokens that no other component consumes yet). The `landing-hero.tsx` delete is the only breaking change, and it's reverted by restoring the file. Deploy order: (1) ship the new `hero/` directory and updated `landing.tsx` import; (2) ship the controller change; (3) remove the old `landing-hero.tsx`. Steps 1 and 2 are non-breaking because the old import path can coexist with the new one for a single deploy window.

## Open Questions

- [ ] **Unit testing the hooks** — should we add vitest + React Testing Library for the two hooks, or rely solely on the PHPUnit + Inertia feature tests above? Adding vitest introduces a new runner (project has none). Recommended: feature tests only for this change; revisit if a future change needs isolated hook tests.
- [ ] **Stagger delay range** — the spec mandates 60–120ms between children. The current hero uses 100/200/300ms. Recommend settling on 80ms (snappy, modern) vs 100ms (current). Default to 80ms unless a design pass says otherwise.
- [ ] **Wordmark position on mobile** — on `< 768px` the wordmark + tech grid stack below the headline. Should the tech grid appear *after* the wordmark (current design) or be hidden on mobile to save vertical space? Default: keep visible, just stack vertically.
- [ ] **`Tech::orderByUsage()` query** — controller needs a way to pick the top 5 techs by usage. Options: count `project_tech` rows and `groupBy`; or use a simple `Tech::orderByDesc('projects_count')->take(5)` if the model has a counter. To confirm with the team before implementation.
