# Delta for Landing Branding

## MODIFIED Requirements

### Requirement: Real Database Stats

The landing page MUST render `LandingStats` with real database counts. The section MUST be visible on the landing page, MUST use `project_count`, `user_count`, and `collaboration_count`, and MUST animate its counts on entry.
(Previously: the stats section described animated real counts but did not explicitly require activation on `landing.tsx`.)

#### Scenario: LandingStats is rendered

- GIVEN a visitor loads `/`
- WHEN the landing page renders
- THEN `LandingStats` MUST be present in the page tree
- AND the section MUST be visible below the hero

#### Scenario: Counts remain real and animated

- GIVEN the stats section enters the viewport
- WHEN the numbers animate
- THEN each count MUST reflect controller-provided data
- AND the animation MUST trigger once per page load
