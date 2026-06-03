# Hero Tech Background Specification

## Purpose

Transform the hero's tech badges from a small foreground row at the bottom into a full-viewport atmospheric background grid. The tech names become a subtle, interactive texture that spans the entire hero section — reinforcing the platform's developer identity without competing with the foreground content.

## Requirements

### Requirement: Full-Viewport Tech Background Grid

The hero MUST render a dense grid of technology names as an absolutely-positioned background layer behind all foreground content. The grid SHALL cover the entire hero section (`inset-0`) and SHALL NOT cause layout shift. The background grid MUST use a CSS Grid layout with cells sized between 110px and 140px to create a dense, textile-like pattern.

#### Scenario: Grid covers the full hero area

- GIVEN the hero section renders
- WHEN the tech background component mounts
- THEN a grid container MUST be positioned `absolute inset-0` with `pointer-events: auto`
- AND the grid SHALL span the full width and height of the hero section
- AND no foreground content SHALL be displaced or shifted

#### Scenario: Grid uses CSS Grid layout with fixed cells

- GIVEN the tech background is visible
- WHEN the grid styles are inspected
- THEN `display: grid` MUST be used
- AND `grid-template-columns` MUST use `repeat(auto-fill, minmax(120px, 1fr))`
- AND each cell SHALL be between 110px and 140px wide

### Requirement: Tech Data Set

The background MUST display at least 40 distinct technology names drawn from a curated array. The techs SHALL cover frontend, backend, languages, mobile, database/infra, DevOps, AI/ML, and tools categories. The array SHALL be defined as a module-level constant and SHALL NOT be fetched from the server.

#### Scenario: Tech array contains at least 40 entries

- GIVEN the component loads
- WHEN the tech array is inspected
- THEN it MUST contain at least 40 unique tech names
- AND each entry MUST have a `name` string and, when available, an associated icon component

#### Scenario: No server round-trip for tech data

- GIVEN the hero renders
- WHEN network activity is inspected
- THEN no request SHALL be made to fetch tech names
- AND the array SHALL be fully defined at compile time

### Requirement: Subtle Base Opacity

Each tech cell in the background grid MUST render with a very low base opacity that makes the text barely perceptible — intended as a texture rather than readable content. The base opacity SHALL be between `0.02` and `0.04` in light mode, and between `0.03` and `0.06` in dark mode to account for lower contrast on dark backgrounds.

#### Scenario: Base opacity is barely visible

- GIVEN the hero is rendered
- WHEN a tech cell's computed opacity is measured
- THEN the opacity MUST be ≤ 0.04 for light mode
- AND the opacity MUST be ≤ 0.06 for dark mode
- AND the cell MUST NOT have `visibility: hidden` or `display: none`

### Requirement: Hover Reveal Interaction

When a user hovers over any tech cell in the background grid, that specific cell MUST visually respond to signal interactivity. The hover effect SHALL transition smoothly and MUST NOT affect adjacent cells. The effect SHALL be achievable with pure CSS (no JavaScript event listeners for hover detection).

#### Scenario: Cell brightens on hover

- GIVEN the tech background is visible
- WHEN the user hovers over a tech cell
- THEN that cell's opacity MUST increase to at least `0.12`
- AND the cell MUST gain a subtle background highlight (`bg-foreground/5` or equivalent CSS variable)
- AND the transition SHALL use `transition: all 0.3s ease`
- AND adjacent cells MUST remain at their base opacity

#### Scenario: No JavaScript hover handlers

- GIVEN the component is rendered
- WHEN the component source is inspected
- THEN no `onMouseEnter`, `onMouseLeave`, or `addEventListener` for hover events SHALL be present
- AND the hover effect MUST use the CSS `:hover` pseudo-class

### Requirement: Tech Text Rendering

Each cell SHALL render the technology name in a monospace or code-oriented font face at a small size (10px–12px). Cells with known icon components MAY render the icon alongside the name, but icons SHALL be tiny (12px–14px) to maintain the textile quality. The text color SHALL inherit the foreground color at the grid's low opacity.

#### Scenario: Tech name renders in monospace at small size

- GIVEN a tech cell is rendered
- WHEN the cell style is inspected
- THEN `font-family` MUST use the monospace token (`--font-mono` or equivalent)
- AND `font-size` MUST be between 10px and 12px
- AND the cell SHALL NOT have `user-select: none` (text remains selectable)

### Requirement: Performance and Paint Isolation

The tech background grid MUST NOT degrade rendering performance. The component SHALL use `will-change: opacity` on hoverable cells where beneficial, SHALL NOT trigger layout on hover (only compositor properties), and SHALL use `content-visibility: auto` if the grid extends beyond the initial viewport.

#### Scenario: Hover only triggers compositor paint

- GIVEN a tech cell is hovered
- WHEN the triggered CSS properties are inspected
- THEN only `opacity` and `background-color` SHALL change
- AND no `transform`, `width`, `height`, `margin`, or `padding` SHALL animate on hover

### Requirement: Reduced Motion Compliance

The tech background MUST respect `prefers-reduced-motion: reduce`. When the user has reduced motion enabled, all transitions SHALL be removed — the cells SHALL snap instantly to their hover state with no duration.

#### Scenario: Reduced motion disables transitions

- GIVEN the user has `prefers-reduced-motion: reduce`
- WHEN hovering over a tech cell
- THEN `transition-duration` MUST be `0s`
- AND the hover effect SHALL appear instantly without animation

### Requirement: Integration Into Landing Hero

The existing `landing-hero.tsx` MUST replace its floating tech badges section with the new `HeroTechBackground` component. The floating tech array (`floatingTechs`), its associated badge rendering, and any icon imports used only by those badges SHALL be removed. The `HeroTechBackground` SHALL render inside the hero `<section>`, after the existing background orbs but before the content container.

#### Scenario: Floating badges are removed

- GIVEN `landing-hero.tsx` is opened
- WHEN the file is inspected
- THEN no `<Badge>` element SHALL render for tech names in the foreground
- AND the `floatingTechs` array SHALL NOT exist
- AND the icon imports used exclusively by floating badges SHALL be removed

#### Scenario: HeroTechBackground renders in the correct z-order

- GIVEN the hero section renders
- WHEN the stacking context is inspected
- THEN `HeroTechBackground` SHALL have a lower z-index than the content container (`z-10`)
- AND `HeroTechBackground` SHALL render after `hero-background` dots/orbs in the DOM
- AND the content (headline, CTAs) SHALL remain fully readable above the tech grid

### Requirement: Accessibility

The tech background grid MUST be hidden from screen readers using `aria-hidden="true"` since it is purely decorative. Individual tech cells MUST NOT be focusable via keyboard. The hover interaction is a visual enhancement only and SHALL NOT convey information required for understanding or using the page.

#### Scenario: Background is hidden from assistive technology

- GIVEN a screen reader is active
- WHEN navigating the hero section
- THEN the tech background container MUST have `aria-hidden="true"`
- AND no tech cell SHALL receive keyboard focus (`tabindex="-1"` or no tabindex on non-interactive elements)
- AND the screen reader MUST skip the entire grid

## Tech Data (Curated Array)

The module-level constant SHALL contain at least these entries, organized conceptually but stored as a flat array:

| Category | Technologies |
|----------|-------------|
| Frontend | React, Vue, Angular, Svelte, Next.js, Nuxt, SolidJS, Astro, Remix, Qwik |
| Backend | Laravel, Django, Rails, Express, FastAPI, Spring Boot, Gin, Fiber, Actix, Hono |
| Languages | TypeScript, Python, Rust, Go, Java, Kotlin, Swift, C#, PHP, Ruby, Zig, Elixir |
| Mobile | React Native, Flutter, SwiftUI, Jetpack Compose, Kotlin Multiplatform |
| Database | PostgreSQL, MySQL, MongoDB, Redis, SQLite, Prisma, Supabase, DynamoDB |
| DevOps | Docker, Kubernetes, Terraform, GitHub Actions, CircleCI, Ansible |
| AI/ML | PyTorch, TensorFlow, LangChain, Hugging Face, OpenAI, Ollama |
| Tools | Vite, Turborepo, Playwright, Vitest, ESLint, Prettier, Biome, Bun |

## Files to Modify

| File | Action |
|------|--------|
| `resources/js/components/landing/hero/hero-tech-background.tsx` | **CREATE** — new component |
| `resources/js/components/landing/landing-hero.tsx` | **MODIFY** — replace floating badges, integrate new background |
| `resources/css/app.css` | **MODIFY** — add tech-breathe animation keyframe (optional) |

## Files NOT Modified

- `hero-tech-grid.tsx` — separate component for project detail pages
- `hero-background.tsx` — retains dot pattern + orbs; tech grid layers on top
- `hero-headline.tsx`, `hero-cta.tsx`, `hero-wordmark.tsx` — unchanged
- `types.ts` — no new props required; self-contained component
