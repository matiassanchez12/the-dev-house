# Exploration: landing-hero-trust-activation

## Current State

The landing hero is already modular and well-structured thanks to the prior `landing-branding` refactor. It lives in `resources/js/components/landing/landing-hero.tsx` and delegates to five co-located subcomponents under `resources/js/components/landing/hero/`:

1. **HeroBackground** — radial dot-pattern + two soft primary-colored blur orbs
2. **HeroTechBackground** — interactive orbit of 60+ tech icons with mouse spotlight effect, responsive across mobile/tablet/desktop
3. **HeroHeadline** — h1 headline (Spanish) + subtitle paragraph
4. **HeroWordmark** — **EMPTY SHELL**: renders a styled `<div>` with `font-mono` but contains zero content (just an empty child div with muted text)
5. **HeroCta** — two buttons: primary ("Crear mi perfil" / "Crear proyecto") and secondary ("Ver proyectos")

The `LandingController` already passes **real database counts** (`user_count`, `project_count`, `collaboration_count`) to the landing page. `LandingStats` (a fully-built stats section with animated count-up, icons, and scroll-triggered reveal) exists but is **commented out** in `landing.tsx`.

### Affected Areas

| File | Why Affected | Impact |
|------|-------------|--------|
| `resources/js/components/landing/hero/hero-headline.tsx` | Must add trust badge/pill above h1; headline copy should emphasize creation, not just joining | Medium |
| `resources/js/components/landing/hero/hero-wordmark.tsx` | Currently empty; must be replaced with real trust element or removed | Medium |
| `resources/js/components/landing/hero/hero-cta.tsx` | Must strengthen primary CTA visual treatment; copy may shift to emphasize creation | Medium |
| `resources/js/components/landing/hero/hero-background.tsx` | Polish: stronger orbs, refined opacity for premium feel | Low |
| `resources/js/components/landing/hero/hero-tech-background.tsx` | Mobile orbit config may need fine-tuning for better presentation | Low |
| `resources/js/components/landing/landing-stats.tsx` | Evaluate activation — it is built but commented out | Low (high value) |
| `resources/js/pages/landing.tsx` | Uncomment `LandingStats` if activated; no structural changes otherwise | Low |
| `resources/js/components/landing/landing-hero.tsx` | May adjust spacing, stagger delays, or remove `HeroWordmark` slot | Low |

## Approaches

### Approach A: Conservative Polish + Stats Activation (Recommended)

Add trust signals directly inside the hero, polish existing elements, and activate the pre-built stats section below the hero.

- **Badge**: Add a pill/badge above the headline (e.g., "Join X developers building real projects together" — wired to `user_count` from props)
- **Headline**: Shift copy to emphasize both creation and collaboration (e.g., "Create real projects with other developers / and turn practice into portfolio")
- **HeroWordmark replacement**: Replace the empty shell with a trust bar: 3-4 micro-badges ("Open source", "Community-driven", "Free forever", or similar) or a social-proof avatar stack
- **CTA**: Strengthen visual treatment — larger `size="lg"` with an arrow icon, consider "Start building free" / "Empezá gratis" for guest state to emphasize agency
- **Background**: Slightly boost orb opacity/blur for a more premium feel; verify dot pattern doesn't feel noisy on OLED dark mode
- **Mobile**: Verify orbit radii and tile sizes feel balanced; reduce max items slightly if tiles feel cramped
- **LandingStats**: **Uncomment in `landing.tsx`** — this is the single biggest trust win because it shows real, animated counts

- **Pros**: Low risk, reuses existing components, hits all 5 epic #139 goals, respects non-goals (no full redesign, no heavy animations)
- **Cons**: Doesn't fundamentally restructure the hero; some users may still see it as "just another SaaS landing"
- **Effort**: Low-Medium

### Approach B: Structural Hero Recomposition + Social Proof Inline

Merge `HeroWordmark` into the headline area and inject a social-proof row directly inside the hero, restructure layout.

- Remove `HeroWordmark` entirely; reclaim its vertical space
- Add a social-proof row directly under the headline: avatar stack of real users + short trust text ("X developers already collaborating")
- Restructure headline to be slightly more compact, allowing room for the social proof
- Keep `LandingStats` commented out to avoid duplication (social proof in hero replaces it)

- **Pros**: Trust signal is visible immediately without scrolling; cleaner vertical rhythm
- **Cons**: More invasive; the hero is already tall (100vh minus 1px); adding more content risks pushing CTA below fold on mobile; conflicts with the orbital background's visual centering
- **Effort**: Medium

### Approach C: Minimal Copy + Stats Only

Only activate `LandingStats` and do minor copy tweaks. Do not touch badge, wordmark, or CTA styling.

- Uncomment `LandingStats`
- Tweak headline to mention creation
- Done

- **Pros**: Fastest possible implementation; zero risk of regression
- **Cons**: Doesn't materially improve "perceived quality" or "trust" inside the hero itself; stats are below the fold
- **Effort**: Low

## Recommendation

**Approach A (Conservative Polish + Stats Activation)** is the right V1 direction. It:

1. **Activates `LandingStats`** — the highest-value, lowest-effort change. Real animated counts directly address "transmit more trust" and "show more real activity"
2. **Replaces the dead `HeroWordmark`** with a trust bar or micro-badges, fixing an obvious visual gap
3. **Adds a badge** wired to real user count, creating immediate social proof above the fold
4. **Strengthens the CTA** with stronger copy and visual weight, improving activation
5. **Keeps changes scoped** to the hero and immediate surroundings, respecting non-goals

The existing hero architecture is solid. We should build on it, not tear it down.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `LandingStats` activation causes layout shift on mobile | Low | Medium | Test on 375px viewport; the section is self-contained and uses `container mx-auto px-4` |
| Headline copy change reduces clarity for Spanish-speaking users | Low | Medium | Keep copy concise; A/B not possible now, but keep fallback option ready |
| Trust badge above headline adds visual clutter | Low | Low | Use subdued styling (muted background, small text) so it reads as metadata, not a competing element |
| HeroWordmark replacement breaks existing `InViewItem` stagger animation | Low | Low | Maintain the same wrapper structure; only swap inner content |
| Mobile orbit tiles feel cramped after adding badge | Low | Low | Badge is above the orbit's vertical center; orbit starts at ~48% top, so minimal overlap risk |

## Ready for Proposal

**Yes.** The current codebase state is well-understood. The `landing-branding` prior art gives us a solid foundation. All required data is already wired. The scope is clear and bounded.

**What the orchestrator should tell the user:**

- The hero is already modular and well-architected from the prior `landing-branding` refactor
- `LandingStats` is fully built but commented out — activating it is the fastest trust win
- `HeroWordmark` is currently an empty shell; we can replace it with real trust content
- The primary CTA can be strengthened with better copy and visual weight
- We should proceed to `sdd-propose` with Approach A as the default, and flag that mobile presentation may need a quick visual verification during apply

## Key Discoveries

1. **`LandingStats` is built but commented out** in `landing.tsx` (lines 38-43). The controller already passes real counts. Uncommenting is trivial.
2. **`HeroWordmark` is empty** — it renders a styled container with no text or content. This is a known visual gap from the prior refactor.
3. **The headline copy emphasizes joining/practicing**, not creating. The CTA for guests says "Crear mi perfil" which is registration-oriented, not creation-oriented.
4. **The orbit background already has responsive configs** for mobile (3 rings, 18 max items, no labels), tablet (4 rings, 30 max items), and desktop (5 rings, full set, labels). Mobile is already considered but may benefit from fine-tuning.
5. **No backend changes are needed** for this refactor — all data is already available via `LandingController`.
