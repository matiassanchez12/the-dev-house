# Exploration: landing-hero-stats-visual-continuity

## Current State

The landing page is a vertical stack of sections: Nav → Hero → Stats → Manifesto → …

- **Hero** (`landing-hero.tsx`) renders `HeroBackground` (static blurred blobs + dotted radial mask) and `HeroTechBackground` (mouse-tracking orbit spotlight with 70+ tech tiles). Content animates in via `animate-fade-in-up` with 0/80/160 ms stagger. The hero has no **ambient** motion — only entrance animations and interaction-driven spotlight.
- **Stats** (`landing-stats.tsx`) abruptly switches to `bg-primary-soft` (oklch(0.55 0.10 38.402)) with `bg-dots-primary`. It has scroll-triggered count-ups and staggered fade-in-up, but no connection to the hero above.

### The Visual Break

The hero ends on `bg-background` (near-white). Stats begins on a saturated warm tone with no bridge. The bottom blurred blobs in `HeroBackground` are confined to the hero’s bounds, so there is zero bleed or gradient transition. It feels like two unrelated surfaces colliding.

## Affected Areas

| File | Why affected |
|------|-------------|
| `resources/js/components/landing/landing-hero.tsx` | Needs ambient motion layer; may need overflow/y-axis adjustments for bleed |
| `resources/js/components/landing/hero/hero-background.tsx` | Blobs are static; should drift subtly and extend below the hero boundary |
| `resources/js/components/landing/landing-stats.tsx` | Needs a softened top edge to receive the hero bleed |
| `resources/css/app.css` | May need a slower `float` variant or new ambient keyframe (current `float` is 6s, `bob` is 3s) |

## Approaches

### 1. Ambient Motion + Gradient Bridge (Conservative)

- Add a very slow `animate-float` (e.g. 10s) to `HeroBackground` blobs so the hero feels alive.
- Insert a `h-24` `bg-gradient-to-b from-background via-primary/5 to-primary-soft` element between hero and stats as a explicit bridge.
- Keep everything else untouched.

**Pros:**
- Minimal code change (~3–5 lines + 1 CSS rule)
- No risk of layout shift or z-index issues
- Easy to revert

**Cons:**
- Gradient bridges can look like a "band-aid" if the color stops are visible
- Does not truly unify the two sections; just smooths the seam
- The bridge element is an extra DOM node purely for cosmetics

**Effort:** Low

### 2. Unified Continuous Canvas (Maximal)

- Wrap Hero + Stats in a shared container with a single continuous background treatment (`bg-glow-double` or custom radial gradient spanning both).
- Stats drops `bg-primary-soft` and uses a semi-transparent overlay (`bg-primary/10` on white) so the shared canvas shows through.
- Add ambient float to the shared canvas blobs.

**Pros:**
- True visual continuity; no seam at all
- Premium, editorial feel

**Cons:**
- Stats loses its distinct "soft primary" identity; may look washed out
- Restructures `landing.tsx` page layout (shared wrapper, children adjustments)
- Higher risk of regressions on mobile (shared canvas must scale across two sections)
- More changed lines, harder to review

**Effort:** High

### 3. Overlap / Bleed with Subtle Ambient Motion (Recommended)

- **Hero:** Extend the bottom blurred blob in `HeroBackground` so it bleeds **below** the hero’s bottom edge by ~60–80 px (absolute positioning, negative bottom). Give it a very slow `animate-float` (8–10 s cycle, reduced amplitude) so the hero feels alive without competing with the mouse spotlight.
- **Stats:** Replace the hard top edge with a radial or linear gradient overlay at the top (`from-primary/10 via-primary-soft to-primary-soft`) that blends with the overlapping blob. Adjust top padding slightly so content does not collide with the bleed.
- **CSS:** Add one slow variant keyframe (e.g. `animate-float-slow`) or reuse existing `animate-float` with inline style overrides for duration.

**Pros:**
- Best balance of quality and safety — organic, premium feel with minimal code
- Uses existing animation primitives already in `app.css`
- No structural changes to page layout; sections remain independent
- Keeps `bg-primary-soft` identity while softening the entry
- Natural parallax-like overlap without JS scroll listeners

**Cons:**
- Requires careful `z-index` and responsive testing (the bleed must not clip)
- Hero’s `overflow-x-hidden overflow-y-visible` needs verification — the bleed blob must not be clipped
- Reduced-motion users should see static overlap (already covered by `motion-reduce` patterns in the codebase)

**Effort:** Low–Medium

## Recommendation

**Adopt Approach 3 (Overlap / Bleed + Ambient Motion).**

Rationale:
1. **Continuity** — The overlap creates a natural, organic transition rather than an artificial gradient strip.
2. **Motion subtlety** — A slow 8–10 s float on the background blobs adds life without distracting from the tech spotlight or the headline.
3. **Visual cohesion** — The stats section retains its warm identity while the hero’s primary color literally bleeds into it, reinforcing brand consistency.
4. **Implementation safety** — No new dependencies, no layout restructuring, and the changes are almost entirely CSS/Tailwind.

## Risks

1. **Clipping from hero overflow settings** — The hero section uses `overflow-x-hidden overflow-y-visible`. A negative-bottom bleed blob might be clipped depending on ancestor stacking context. Must test visually.
2. **Mobile overlap** — On narrow viewports the bleed may consume too much vertical space or collide with stats content. The overlap height should be responsive (`h-16 md:h-24`).
3. **Reduced motion** — The float animation must be suppressed for `prefers-reduced-motion`. The codebase already uses `motion-reduce:transition-none` and `motion-safe:` prefixes; we should extend this pattern.

## Ready for Proposal

Yes. The scope is well bounded, the approach is chosen, and the risk profile is low. The orchestrator can proceed to `sdd-propose`.
