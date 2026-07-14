# Delta for Landing Branding

## MODIFIED Requirements

### Requirement: Real Database Stats

The landing page MUST display real counts from the database, not hardcoded values. The stats section MUST keep its existing count-up behavior and MUST visually receive the hero bleed through a softened top edge or equivalent overlay. The top of the stats section MUST NOT read as a hard horizontal seam against the hero. Counts SHALL animate when the section enters the viewport.
(Previously: the stats section animated real counts but its top edge did not blend with the hero above.)

#### Scenario: Stats section blends with the hero

- GIVEN the landing page is rendered
- WHEN the hero and stats sections are viewed together
- THEN the top of the stats section MUST blend smoothly with the hero above
- AND no abrupt color break MUST be visible between sections

#### Scenario: Counts still animate once on entry

- GIVEN the stats section enters the viewport
- WHEN the counts animate
- THEN each count MUST reflect controller-provided data
- AND the animation MUST trigger only once per page load
