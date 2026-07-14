# Delta for Landing Hero

## MODIFIED Requirements

### Requirement: Atmospheric Background

The hero MUST render an atmospheric background layer behind all content. It MUST use design-system tokens, include the existing dot or grid pattern with a radial mask, and include one soft primary-colored glow behind the wordmark area. The lower glow MUST extend slightly below the hero boundary so it visually connects to the next section. The lower glow SHOULD move with a very subtle, slow ambient float, and MUST remain static when `prefers-reduced-motion: reduce` is enabled. The atmosphere MUST NOT cause layout shift or compete with foreground content.
(Previously: the background was confined to the hero bounds and did not provide a visual bridge to the stats section.)

#### Scenario: Lower glow overlaps the next section

- GIVEN the landing page is rendered
- WHEN the hero and stats sections are visible together
- THEN the hero's lower glow MUST continue into the top edge of the stats section
- AND the transition MUST NOT appear clipped or abrupt

#### Scenario: Reduced motion keeps the overlap static

- GIVEN the user has `prefers-reduced-motion: reduce`
- WHEN the hero renders
- THEN the lower glow MUST remain visible without motion
- AND no ambient float animation MUST run
