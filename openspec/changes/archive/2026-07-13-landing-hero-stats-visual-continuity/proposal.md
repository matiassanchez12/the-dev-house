# Proposal: Landing Hero–Stats Visual Continuity

## Intent

The landing page hero ends on a near-white background while the stats section begins on a saturated warm tone (`bg-primary-soft`) with no visual bridge. This abrupt seam weakens the premium feel. We will add subtle ambient motion to the hero and bleed its bottom glow into the stats section so the transition feels organic rather than clipped.

## Scope

### In Scope
- Slow ambient float animation on `HeroBackground` blobs (8–10 s cycle, reduced amplitude).
- Extend the bottom blob below the hero boundary so it overlaps the stats top edge.
- Add a soft gradient overlay at the top of `LandingStats` to blend with the overlapping blob.
- One new CSS keyframe variant (`animate-float-slow`) in `app.css`.
- `prefers-reduced-motion` compliance (static overlap, no animation).

### Out of Scope
- No structural changes to page layout or section stacking.
- No changes to stats content, count-up logic, or data wiring.
- No dark-mode-specific behavior beyond existing tokens.
- No new dependencies.

## Capabilities

### New Capabilities
- None (pure visual polish; no new behavioral contracts).

### Modified Capabilities
- None (no spec-level requirement changes; implementation-only visual refinement).

## Approach

Adopt **Approach 3: Overlap / Bleed with Subtle Ambient Motion** from exploration.

1. **HeroBackground**: Apply a very slow `animate-float-slow` to the bottom blob. Extend it with negative bottom positioning so it bleeds ~60–80 px below the hero section. Keep the top blob static to avoid distraction.
2. **LandingStats**: Insert a `from-primary/10 via-primary-soft to-primary-soft` gradient overlay at the top of the section so the bleed color softens into the stats background. Adjust top padding slightly to prevent content collision.
3. **CSS**: Add `animate-float-slow` (10 s, ±10 px amplitude) alongside the existing `float` keyframe. Use `motion-reduce:animation-none` to respect accessibility.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/landing/hero/hero-background.tsx` | Modified | Bottom blob gains negative bottom offset + slow float |
| `resources/js/components/landing/landing-stats.tsx` | Modified | Top gradient overlay added; minor padding adjustment |
| `resources/css/app.css` | Modified | New `animate-float-slow` keyframe and token |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bottom blob clipped by ancestor overflow | Med | Verify `overflow-x-hidden overflow-y-visible` on hero; test visual regression on mobile |
| Mobile overlap consumes too much vertical space | Low | Use responsive height (`h-16 md:h-24`) for bleed |
| Reduced-motion users see unwanted motion | Low | Apply `motion-reduce:animation-none` to float layer |

## Rollback Plan

1. Revert `hero-background.tsx` to remove negative bottom offset and animation class.
2. Remove the gradient overlay div from `landing-stats.tsx` and restore original padding.
3. Delete `animate-float-slow` from `app.css`.
All changes are additive and localized; rollback is a simple revert of three files.

## Dependencies

- None (uses existing Tailwind/CSS primitives).

## Success Criteria

- [ ] Bottom hero blob visibly overlaps the stats section top edge on desktop and mobile.
- [ ] Blob drifts slowly (one cycle ~10 s) without distracting from foreground content.
- [ ] Stats top edge shows a smooth color transition rather than a hard line.
- [ ] `prefers-reduced-motion: reduce` disables the float entirely.
- [ ] No layout shift or content collision in stats on any viewport (320 px – 1440 px).
