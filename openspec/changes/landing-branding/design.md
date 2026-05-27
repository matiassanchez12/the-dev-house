# Design: Landing Branding — "The Dev House"

## Technical Approach

Refactor the landing page from a static, generic layout into a branded, animated experience with real data. Replace all "DevCollab" references with "The Dev House", create a custom inline SVG logo, add scroll-triggered animations via IntersectionObserver hooks, wire DB counts through `LandingController`, and remove dead code (`welcome.tsx`). All changes are frontend + one controller modification — no new database schema or API endpoints.

## Architecture Decisions

| Decision | Option A (chosen) | Option B (rejected) | Rationale |
|----------|-------------------|---------------------|-----------|
| Logo component | Inline SVG in `application-logo.tsx` (replace existing) | New `brand-logo.tsx` alongside old | Existing logo is Laravel SVG — replace in-place to avoid orphaned component. All consumers already import `application-logo`. |
| Hero background | CSS radial-gradient dot pattern + absolute positioned orbs | Canvas-based gradient mesh | Canvas adds ~2KB runtime + complexity. CSS-only approach is ~20 lines, GPU-composited, and respects `prefers-reduced-motion`. |
| Count-up animation | Custom `useCountUp` hook with `requestAnimationFrame` | Third-party library (e.g. `react-countup`) | Only 3 numbers to animate. Adding a dependency for 3 calls is overkill. Hook is ~30 lines, tree-shakeable. |
| Scroll animations | `useInView` hook wrapping IntersectionObserver, single-trigger | CSS `@keyframes` on load or scroll event listener | IntersectionObserver is the standard pattern. Scroll listeners fire 60fps and cause layout thrashing. Single-trigger via `unobserve()` after first intersection. |
| Stats metric | `user_count`, `project_count`, `collaboration_count` (sum of `project_participants` rows) | Complex aggregation with joins | `ProjectParticipant::count()` is a single query. Spec says "simpler metric" is acceptable. |
| Sticky nav behavior | `position: sticky` with `backdrop-blur` class applied always | JS scroll listener to toggle blur class | `backdrop-blur` on a sticky element is cheap — browser composites it. No JS needed. |
| Footer links | Remove placeholder `href="#"` links entirely | Replace with `#` or `javascript:void(0)` | Spec says "no placeholder links". Better to show fewer links than fake ones. |

## Data Flow

```
  GET /
    │
    ▼
  LandingController::__invoke()
    │
    ├── User::count()        ──→ user_count (int)
    ├── Project::count()     ──→ project_count (int)
    └── ProjectParticipant::count() ──→ collaboration_count (int)
    │
    ▼
  Inertia::render('landing', { projects, user_count, project_count, collaboration_count })
    │
    ▼
  landing.tsx
    │
    ├── LandingNav         ← brand logo (left), links (center), CTA (right)
    ├── LandingHero        ← animated dot pattern + staggered fade-in
    ├── LandingStats       ← useCountUp(3 numbers) triggered by useInView
    ├── LandingHowItWorks  ← 3-step Discover → Collaborate → Ship
    ├── LandingSocial      ← avatar stack + testimonial cards
    ├── LandingManifesto   ← brand statement
    ├── FeaturedProjects   ← existing project cards (kept)
    ├── FeaturesSection    ← existing features (kept, re-styled)
    ├── CTASection         ← existing CTA (kept)
    └── Footer             ← cleaned, branded, no placeholders
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/application-logo.tsx` | Modify | Replace Laravel SVG with geometric house+code-bracket inline SVG. Two display modes via `variant` prop: `"full"` (with text) and `"icon"` (icon-only). |
| `resources/js/pages/landing.tsx` | Modify | Full rewrite. Import new landing section components, hooks, and real stats props. Keep featured projects, features, and CTA sections with updated styling. |
| `resources/js/components/landing/landing-nav.tsx` | Create | Sticky nav with logo, center links, CTA button. Uses `position: sticky top-0` + `backdrop-blur-md bg-background/80`. |
| `resources/js/components/landing/landing-hero.tsx` | Create | Hero section with CSS dot-pattern background (radial-gradient), floating orbs, staggered headline/subtitle/CTA fade-in. |
| `resources/js/components/landing/landing-stats.tsx` | Create | Stats section receiving `user_count`, `project_count`, `collaboration_count`. Each number animates via `useCountUp` when `useInView` triggers. |
| `resources/js/components/landing/landing-how-it-works.tsx` | Create | 3-step visual flow: Discover (search icon), Collaborate (users icon), Ship (rocket icon). Connecting lines between steps on desktop, stacked on mobile. |
| `resources/js/components/landing/landing-social.tsx` | Create | Avatar stack (overlapping circles) + 2-3 testimonial cards with quotes. Static data for now. |
| `resources/js/components/landing/landing-manifesto.tsx` | Create | Brand statement section with accent-colored background treatment. |
| `resources/js/hooks/use-in-view.ts` | Create | `useInView(threshold?: number, rootMargin?: string)` → `{ ref, inView }`. Wraps IntersectionObserver. Unobserves after first trigger (single-trigger). |
| `resources/js/hooks/use-count-up.ts` | Create | `useCountUp(target: number, duration?: number, trigger: boolean)` → `current: number`. Uses `requestAnimationFrame` loop. Returns 0 until trigger is true. |
| `resources/js/layouts/guest.tsx` | Modify | Add tagline "Where developers build together" below logo. Add subtle dot-pattern background to the layout container. |
| `resources/js/types/index.ts` | Modify | Add `LandingPage` interface with `user_count`, `project_count`, `collaboration_count` fields. |
| `app/Http/Controllers/LandingController.php` | Modify | Add `User::count()`, `Project::count()`, `ProjectParticipant::count()` to Inertia props. |
| `resources/js/pages/onboarding/index.tsx` | Modify | Change `<Head title="Welcome to DevCollab">` → `"Welcome to The Dev House"`. |
| `resources/js/pages/welcome.tsx` | Delete | Dead Breeze page. No route references it. |
| `tailwind.config.js` | Modify | Add `float`, `float-delayed`, `bob` keyframes and animations. |
| `resources/css/app.css` | Modify | Add `.dot-pattern` utility class with radial-gradient background. |
| `.env.example` | Modify | `APP_NAME="The Dev House"` |
| `config/app.php` | Modify | Fallback name: `'The Dev House'` instead of `'Laravel'`. |

## Interfaces / Contracts

### LandingPage Props (TypeScript)

```typescript
interface LandingPageProps {
    auth: { user: User | null };
    projects: { data: Project[]; total: number };
    user_count: number;
    project_count: number;
    collaboration_count: number;
}
```

### useInView Hook

```typescript
function useInView(options?: {
    threshold?: number;    // default: 0.1
    rootMargin?: string;   // default: '0px'
    triggerOnce?: boolean; // default: true
}): { ref: React.RefObject<Element | null>; inView: boolean }
```

### useCountUp Hook

```typescript
function useCountUp(
    target: number,
    options?: {
        duration?: number;   // default: 2000ms
        trigger?: boolean;   // default: true (start immediately)
        decimals?: number;   // default: 0
    }
): number  // current animated value
```

### BrandLogo Component Props

```typescript
interface ApplicationLogoProps extends React.SVGProps<SVGSVGElement> {
    variant?: 'full' | 'icon';  // default: 'icon'
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Feature (PHP) | `LandingController` returns correct DB counts | Create users/projects/participants in test DB, assert props match counts |
| Feature (PHP) | `GET /` renders landing page with Inertia | Assert response status 200, component name "landing" |
| Feature (PHP) | `GET /` no longer renders "welcome" component | Assert component is "landing", not "welcome" |
| Unit (TS) | `useCountUp` animates from 0 to target | Mock `requestAnimationFrame`, assert intermediate values |
| Unit (TS) | `useInView` reports `true` on intersection | Mock IntersectionObserver, assert `inView` state change |
| Visual | Brand name "The Dev House" appears everywhere | `rg -i "dev.?collab"` returns zero matches in `resources/` |
| Build | `npm run build` succeeds | CI gate |

## Migration / Rollout

No migration required. All changes are additive or replace existing files. Zero database impact.

## Open Questions

- [ ] Testimonial content: are the 2-3 quotes real user testimonials or placeholder copy for now? (Assuming placeholder — spec doesn't specify source.)
- [ ] Avatar stack: should it show real user avatars from DB or static placeholder images? (Assuming static for this change — can be wired later.)
