# Delta for Landing Hero

## ADDED Requirements

### Requirement: Live Hero Trust Badge

The hero MUST render a subdued badge above the headline using live `user_count` data. The badge SHOULD signal active community size without becoming the main trust proof.

#### Scenario: badge shows live count

- GIVEN the landing page is rendered
- WHEN the hero loads
- THEN a badge MUST appear above the headline
- AND it MUST reflect the live user count

#### Scenario: badge stays readable on mobile

- GIVEN a narrow viewport
- WHEN the hero renders
- THEN the badge MUST remain legible
- AND it MUST NOT crowd the headline

### Requirement: Dual-Path CTA Emphasis

The hero MUST present both a profile-creation path and a project-creation path above the fold. The primary CTA MUST have stronger visual weight, include an arrow icon, and remain clearly distinct from the secondary action.

#### Scenario: primary CTA is dominant but balanced

- GIVEN the hero is rendered
- WHEN the CTAs are inspected
- THEN both paths MUST be visible
- AND the primary CTA MUST be visually stronger than the secondary CTA

#### Scenario: touch targets remain usable on mobile

- GIVEN a mobile viewport
- WHEN the CTAs render
- THEN each CTA MUST remain easy to tap
- AND neither action MAY be hidden behind extra navigation

### Requirement: Premium Hero Atmosphere

The hero background and orbit treatment MUST feel premium and restrained. Decorative depth MAY increase, but content readability and mobile spacing MUST not suffer.

#### Scenario: small screens keep clear spacing

- GIVEN a 375px-wide viewport
- WHEN the hero renders
- THEN the foreground content MUST remain readable
- AND the decorative orbit MUST NOT crowd the CTA area

#### Scenario: reduced motion still shows final state immediately

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the hero loads
- THEN the atmosphere MUST appear without motion
- AND the final layout MUST be visible immediately

## MODIFIED Requirements

### Requirement: Hero Headline Copy

The hero headline MUST communicate ambition, collaboration, and self-starting ownership. The first line SHOULD invite developers to build seriously; the second line SHOULD invite them to launch their own project today. The subtitle MUST describe discovering projects and finding collaborators.
(Previously: headline copy was locked to "Encontrá devs con tu mismo tech stack" / "y llevá tu proyecto al siguiente nivel", with a static badge above it.)

#### Scenario: Headline conveys both collaboration and creation

- GIVEN the landing page is rendered
- WHEN the hero section loads
- THEN the h1 MUST express both finding collaborators and launching a project
- AND the second line SHOULD be visually emphasized

#### Scenario: Exactly one hero h1 is present

- GIVEN the hero is rendered
- WHEN the DOM is queried
- THEN exactly one h1 MUST exist in the hero

### Requirement: Wordmark Visual

The hero MUST render a minimalist premium brand-energy element in the wordmark slot. It MUST NOT be empty, and it MUST NOT present social-proof claims or activity counts.
(Previously: the wordmark rendered a monospace signature with a static command line.)

#### Scenario: Wordmark slot is non-empty

- GIVEN the hero renders
- WHEN the wordmark area is inspected
- THEN it MUST contain visible brand content
- AND it MUST NOT be blank

#### Scenario: Wordmark is not trust proof

- GIVEN the hero renders
- WHEN the wordmark text is read
- THEN it MUST NOT claim user counts or testimonials
- AND it MUST remain brand-only
