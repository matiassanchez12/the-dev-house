# Landing Hero Specification

## Purpose

Defines the composable structure, animation behaviour, accessibility guarantees, and configurable tech-list contract for the landing page hero section. Replaces the monolithic `landing-hero.tsx` with five focused subcomponents, two reusable hooks, and a set of design tokens. Hero copy is locked to its current string and the visual signature is a monospace wordmark + static command line on the left, paired with a static tech grid on the right.

## Requirements

### Requirement: Composable Hero Structure

The landing hero SHALL be composed of exactly five co-located subcomponents under `resources/js/components/landing/hero/`: `hero-background` (atmosphere), `hero-headline` (badge, h1, subtitle), `hero-wordmark` (monospace signature), `hero-tech-grid` (curated tech list), and `hero-cta` (primary and secondary buttons). A root `index.tsx` SHALL compose them in this order. No terminal subcomponent, no typing effect, no continuous animation.

#### Scenario: Root hero renders the five subcomponents in order

- GIVEN a user visits the landing page (`/`)
- WHEN the hero section renders
- THEN `hero-background` MUST render first (behind all content)
- AND `hero-headline` MUST render in the top column
- AND `hero-wordmark` MUST render below the headline
- AND `hero-tech-grid` MUST render in the right column on viewports ≥ 768px
- AND `hero-cta` MUST render last, below the wordmark

#### Scenario: No terminal or typing artefacts remain in the hero source

- GIVEN the refactor is complete
- WHEN the `hero/` directory is inspected
- THEN no file SHALL contain the string `TerminalTypingEffect`
- AND no file SHALL call `setInterval` for typing
- AND no file SHALL include `<style jsx global>`

### Requirement: Hero Headline Copy

The hero headline MUST display the locked copy verbatim: "Encontrá devs con tu mismo tech stack" on the first line and "y llevá tu proyecto al siguiente nivel" on the second line, where the second line uses the primary token. The subtitle MUST read "The Dev House es donde los desarrolladores descubren proyectos, encuentran colaboradores y escriben código que importa." A badge with the text "Donde los desarrolladores construyen juntos" MUST render above the headline.

#### Scenario: Headline renders the exact copy

- GIVEN the landing page is rendered
- WHEN the hero section loads
- THEN the h1 text MUST equal the locked copy
- AND the second line MUST be wrapped in a span with `text-primary`

#### Scenario: Only one h1 exists in the hero

- GIVEN the hero is rendered
- WHEN the DOM is queried
- THEN exactly one `<h1>` element MUST be present
- AND no other heading level (h2, h3) SHALL appear above the h1 in the hero

### Requirement: Wordmark Visual

The hero MUST display a wordmark component that renders "The Dev House" in a monospace font at a large display size, with a single static command line below it: `> devhouse.app` followed by a comment line `// donde los devs construyen juntos`. The wordmark SHALL use the `--font-mono` design token and the command prompt SHALL use the `--wordmark-cursor` token. The wordmark MUST NOT animate, type, blink, or transition on load or scroll.

#### Scenario: Wordmark renders with monospace font and static command

- GIVEN the hero is rendered
- WHEN the wordmark subcomponent loads
- THEN "The Dev House" MUST render with `font-family: var(--font-mono)`
- AND the line `> devhouse.app` MUST render directly below
- AND the comment line MUST render with reduced opacity

#### Scenario: Wordmark is accessible to screen readers

- GIVEN a screen reader is active
- WHEN the wordmark is reached
- THEN the screen reader MUST read "The Dev House" as text content
- AND the screen reader MUST NOT announce any "cursor" or "blinking" state

### Requirement: Configurable Tech Grid

The hero MUST display a tech list driven by a `techs: Tech[]` prop. When the prop is non-empty, the first five items MUST render in a 3×2 grid; any items beyond five MUST be represented by a single overflow slot showing "+N" where N is the count of remaining items. When the prop is empty, the grid MUST fall back to a hardcoded curated set: React, Laravel, TypeScript, Python, Node.js.

#### Scenario: Tech grid renders the prop when provided

- GIVEN the hero receives `techs = [{ name: 'Go' }, { name: 'Rust' }]`
- WHEN the tech grid renders
- THEN the grid MUST render exactly two tech cards
- AND each card MUST show the tech name as a label
- AND no "+N" overflow slot MUST be present

#### Scenario: Tech grid falls back when prop is empty

- GIVEN the hero receives `techs = []`
- WHEN the tech grid renders
- THEN the grid MUST render the five curated techs: React, Laravel, TypeScript, Python, Node.js
- AND no overflow slot MUST be present

#### Scenario: Tech grid shows overflow when more than five items are provided

- GIVEN the hero receives seven techs
- WHEN the tech grid renders
- THEN the first five MUST render as tech cards
- AND the sixth slot MUST render "+2" (not a seventh card)
- AND the overflow slot MUST visually indicate more content is available

### Requirement: Atmospheric Background

The hero MUST render an atmospheric background layer behind all content. The background MUST use the design-system tokens (no hardcoded colors), MUST include a subtle dot or grid pattern with a radial mask, and MUST include one soft primary-colored glow positioned behind the wordmark area. The atmosphere MUST NOT cause layout shift and MUST NOT compete with the foreground content for attention.

#### Scenario: Background uses design tokens only

- GIVEN the hero is rendered
- WHEN the background layer is inspected
- THEN it MUST NOT use hardcoded hex values like `#9CA3AF` or `rgb(...)`
- AND it MUST NOT use Tailwind's `text-green-400`, `bg-gray-900/80`, or `border-gray-700`
- AND any color used MUST come from a CSS custom property defined in `app.css`

#### Scenario: Background renders behind the foreground

- GIVEN the hero is rendered
- WHEN stacking context is inspected
- THEN the background MUST have a z-index lower than the headline, wordmark, tech grid, and CTAs
- AND the atmosphere MUST be visible but opacity SHALL NOT exceed 30%

### Requirement: Accessibility Guarantees

The hero MUST respect `prefers-reduced-motion: reduce` by suppressing all entrance animations. Entrance animations for the headline, wordmark, tech grid, and CTAs MUST trigger exactly once when the hero enters the viewport, and MUST NOT re-trigger on scroll-out-and-back. All CTA buttons MUST have a touch target of at least 44×44 CSS pixels and MUST show a visible focus ring on keyboard focus.

#### Scenario: Hero respects reduced motion preference

- GIVEN the user has `prefers-reduced-motion: reduce` enabled at the OS level
- WHEN the hero loads
- THEN no entrance animation SHALL play
- AND the wordmark and tech grid MUST appear in their final state immediately
- AND no `@keyframes` animation SHALL be applied to any hero element

#### Scenario: Entrance animations trigger once on viewport entry

- GIVEN the hero is initially below the viewport
- WHEN the user scrolls and the hero becomes visible
- THEN each direct child of the hero (headline, wordmark, tech grid, CTAs) MUST fade in with a staggered delay
- AND the stagger delay between consecutive children MUST be between 60ms and 120ms
- AND if the user scrolls away and back, the animation MUST NOT re-trigger

#### Scenario: CTAs meet the touch target minimum

- GIVEN the hero is rendered
- WHEN the CTA buttons are inspected
- THEN each CTA MUST have a height of at least 44px
- AND each CTA MUST have a horizontal padding that yields a total width of at least 44px
- AND the focus ring MUST be at least 2px wide and MUST meet a 3:1 contrast ratio against the background

### Requirement: Backend Wiring

The `LandingController` MUST pass a `techs` array to the Inertia landing view. The `LandingPageProps` TypeScript interface MUST declare `techs: Tech[]` as required. When no curated techs are available, the controller MAY pass an empty array, in which case the hero grid SHALL fall back to its hardcoded set.

#### Scenario: Controller passes techs to the Inertia view

- GIVEN the `LandingController` handles GET `/`
- WHEN it returns the Inertia response
- THEN the response props MUST include `techs: Tech[]`
- AND the value MUST be a JSON-serializable array of `Tech` objects with `id`, `name`, and `slug` fields

#### Scenario: TypeScript types match the controller payload

- GIVEN the landing page TypeScript props
- WHEN `LandingPageProps` is inspected
- THEN it MUST declare `techs: Tech[]` as a required field
- AND the Inertia page MUST compile without a TypeScript error when the controller passes the expected shape
