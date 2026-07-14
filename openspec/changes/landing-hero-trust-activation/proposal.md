# Proposal: Landing Hero Trust & Activation Refactor

## Intent

The landing hero currently feels passive: headline emphasizes joining over creating, the wordmark slot is empty, and real product activity (`LandingStats`) is hidden. This refactor increases perceived quality, transmits trust, and improves activation by making visitors feel they can *launch* projects too, not just join others.

## Scope

### In Scope
- Add a social-proof badge above the headline wired to real `user_count`
- Strengthen primary CTA visual treatment (size, arrow icon, balanced copy)
- Replace `HeroWordmark` with a minimalist, premium brand/energy element
- Polish `hero-background` orbs for a more premium feel
- Fine-tune `hero-tech-background` mobile orbit config
- Evaluate and enable `LandingStats` on `landing.tsx`

### Out of Scope
- Full landing redesign beyond the hero
- Heavy animations or gimmicks
- Non-hero sections (How It Works, Social Proof, Manifesto)
- Backend changes — all data already wired

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `landing-hero`: headline copy now emphasizes creation + collaboration; badge text changes from static to dynamic count; wordmark visual changes from monospace signature to minimalist brand element; CTA treatment strengthened
- `landing-branding`: `LandingStats` visibility requirement updated from commented-out to rendered on landing page

## Approach

Approach A from exploration: conservative polish on existing modular hero architecture. Activate pre-built `LandingStats` for the highest trust-per-effort win. Replace the dead `HeroWordmark` with a minimalist, premium brand-energy element. Keep all changes within the hero subtree; no structural recomposition.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `hero-headline.tsx` | Modified | Add badge pill; update headline copy |
| `hero-wordmark.tsx` | Modified | Replace empty shell with brand/energy element |
| `hero-cta.tsx` | Modified | Strengthen primary CTA visuals and copy balance |
| `hero-background.tsx` | Modified | Boost orb opacity/blur for premium feel |
| `hero-tech-background.tsx` | Modified | Mobile orbit radius/tile fine-tuning |
| `landing-stats.tsx` | Modified | Confirm activation (uncomment in `landing.tsx`) |
| `landing.tsx` | Modified | Uncomment `LandingStats` |
| `landing-hero.tsx` | Modified | Spacing/stagger adjustments if needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mobile layout shift from badge + stats | Low | Test 375px viewport; stats uses `container mx-auto px-4` |
| Headline copy loses clarity in Spanish | Low | Keep concise; keep fallback copy ready |
| Trust badge adds visual clutter | Low | Subdued styling (muted bg, small text) |
| Wordmark replacement breaks stagger animation | Low | Maintain wrapper structure; swap inner content only |

## Rollback Plan

Revert the changed frontend files. No backend or migration changes required. If `LandingStats` causes issues, re-comment the single line in `landing.tsx`.

## Dependencies

None — all data (`user_count`, `project_count`, `collaboration_count`) already passed by `LandingController`.

## Success Criteria

- [ ] `LandingStats` visible and animates real counts on scroll
- [ ] Badge above headline shows live user count
- [ ] Headline copy balances "find collaborators" and "launch your own project"
- [ ] `HeroWordmark` replaced with minimalist premium element (not empty)
- [ ] Primary CTA has stronger visual weight (`size="lg"`, arrow icon)
- [ ] Mobile hero verified: orbit not cramped, CTAs ≥ 44×44px
- [ ] `prefers-reduced-motion` still suppresses entrance animations
- [ ] No regression in login, register, or project creation flows

## Proposal Question Round

The following assumptions are based on user-approved inputs. Confirm or correct before specs:

1. **Headline feeling**: Ambition + "I can do this too" — copy will be energetic and inclusive.
2. **CTA balance**: Both "create profile" and "create project" remain equally weighted in the UI.
3. **Wordmark replacement**: Will be a brand/energy element (minimalist, premium), NOT a social-proof avatar stack.
4. **LandingStats**: Assumed enabled (uncommented) to show real activity counts.
5. **Background polish**: Subtle orb/blur adjustments only; no color palette changes.
