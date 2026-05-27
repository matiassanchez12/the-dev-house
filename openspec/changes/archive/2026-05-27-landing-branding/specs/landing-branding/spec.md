# Landing Branding Specification

## Purpose

Defines the visual identity, branding consistency, and personality features for the landing page and auth flow. Replaces generic "DevCollab" branding with "The Dev House" identity, injects animated landing sections, wires real DB stats, and removes dead code.

## Requirements

### Requirement: Brand Name Consistency

The system MUST display "The Dev House" as the application name across all user-facing surfaces. All prior references to "DevCollab" or "Dev Collab Platform" SHALL be replaced.

#### Scenario: Landing page title reflects new brand

- GIVEN a user visits the landing page (`/`)
- WHEN the page renders
- THEN the `<Head title>` MUST read "The Dev House"
- AND the footer heading MUST read "The Dev House"
- AND the copyright line MUST read "The Dev House"

#### Scenario: Onboarding pages reflect new brand

- GIVEN a user visits any onboarding step
- WHEN the page renders
- THEN the `<Head title>` MUST NOT contain "DevCollab" or "Dev Collab"
- AND the title MUST reference "The Dev House"

#### Scenario: Application config uses new brand name

- GIVEN the `.env` file
- WHEN `APP_NAME` is read
- THEN it MUST equal `"The Dev House"`
- AND `config/app.php` fallback name MUST NOT be "Laravel"

### Requirement: Custom Brand Logo

The system MUST provide a custom inline SVG logo component replacing the default Laravel SVG. The logo SHALL depict a geometric code-bracket combined with a house silhouette.

#### Scenario: Logo renders on landing page header

- GIVEN the landing page is rendered
- WHEN the header section loads
- THEN the `brand-logo` component MUST render in place of `application-logo`
- AND the SVG MUST be inline (no external asset file)

#### Scenario: Logo renders on auth pages

- GIVEN a user visits login or register
- WHEN the guest layout renders
- THEN the `brand-logo` component MUST appear above the auth form
- AND the old Laravel SVG MUST NOT be present

### Requirement: Sticky Navigation

The landing page MUST display a sticky navigation bar that remains visible during scroll. The nav SHALL apply a glassmorphism effect (backdrop-blur) once the user scrolls past the hero section.

#### Scenario: Nav bar sticks on scroll

- GIVEN the user is on the landing page
- WHEN the user scrolls down past the hero section
- THEN the navigation bar MUST remain fixed at the top of the viewport
- AND the nav background MUST apply `backdrop-blur` for glassmorphism

#### Scenario: Nav layout structure

- GIVEN the sticky nav is rendered
- THEN the logo MUST be positioned on the left
- AND navigation links (Features, Projects, Developers) MUST be centered
- AND a CTA button MUST be positioned on the right

### Requirement: Animated Hero Section

The landing page hero MUST feature an animated background with staggered content reveal animations.

#### Scenario: Hero background animation renders

- GIVEN the landing page loads
- WHEN the hero section is visible
- THEN a gradient mesh or dot pattern background MUST be present
- AND the animation MUST use CSS transforms (not layout properties) for performance

#### Scenario: Staggered content fade-in

- GIVEN the hero section is in the viewport
- WHEN the page loads
- THEN the headline, subheadline, and CTA MUST fade in sequentially with staggered delays
- AND floating tech badges MUST exhibit a subtle bob animation

### Requirement: Real Database Stats

The stats section MUST display real counts from the database, not hardcoded values. Counts SHALL animate (count-up) when the section enters the viewport.

#### Scenario: LandingController passes real counts

- GIVEN the `LandingController` handles a GET request to `/`
- WHEN it renders the landing Inertia view
- THEN the props MUST include `project_count`, `user_count`, and `collaboration_count`
- AND each value MUST reflect the current database count

#### Scenario: Stats animate on scroll into view

- GIVEN the stats section is initially below the viewport
- WHEN the user scrolls and the section enters the viewport
- THEN each stat number MUST animate from 0 to its actual value (count-up)
- AND the animation MUST trigger only once per page load

### Requirement: How It Works Section

The landing page MUST include a "How It Works" section with a 3-step visual flow: Discover → Collaborate → Ship.

#### Scenario: Three steps render with connecting visuals

- GIVEN the landing page is rendered
- WHEN the user scrolls to the "How It Works" section
- THEN three steps MUST be displayed: Discover, Collaborate, Ship
- AND each step MUST have an icon and short description
- AND visual connecting lines or arrows MUST link the steps sequentially

### Requirement: Social Proof Section

The landing page MUST include a social proof section with an avatar stack and testimonial cards.

#### Scenario: Avatar stack and testimonials render

- GIVEN the landing page is rendered
- WHEN the user scrolls to the social proof section
- THEN an avatar stack MUST display with text "Join X developers already collaborating"
- AND 2-3 testimonial cards with quotes MUST be visible

### Requirement: Brand Manifesto Section

The landing page MUST include a brand statement section with distinctive background treatment.

#### Scenario: Manifesto renders with branded copy

- GIVEN the landing page is rendered
- WHEN the user scrolls to the manifesto section
- THEN the text "We believe the best code is written together..." MUST be visible
- AND the section MUST have a distinctive background (different from adjacent sections)

### Requirement: Scroll-Triggered Animations

Sections on the landing page MUST reveal with animations when they enter the viewport, using IntersectionObserver.

#### Scenario: Sections animate on viewport entry

- GIVEN a landing page section is initially below the viewport
- WHEN the user scrolls and the section enters the viewport
- THEN the section MUST animate with a fade-in-up effect
- AND child elements within the section MUST animate with staggered delays

#### Scenario: Animation triggers only once

- GIVEN a section has already animated into view
- WHEN the user scrolls away and back
- THEN the animation MUST NOT re-trigger (single-trigger behavior)

### Requirement: Branded Auth Layout

The GuestLayout used for auth pages MUST display The Dev House brand identity with a tagline.

#### Scenario: GuestLayout shows branded logo and tagline

- GIVEN a user visits `/login` or `/register`
- WHEN the guest layout renders
- THEN the `brand-logo` component MUST appear above the form
- AND the tagline "Where developers build together" MUST be visible below the logo
- AND the background MUST include a subtle tinted pattern

### Requirement: Dead Code Removal

The system MUST NOT include the legacy `welcome.tsx` page or its route.

#### Scenario: Welcome page is removed

- GIVEN the codebase after this change
- WHEN `resources/js/pages/welcome.tsx` is checked
- THEN the file MUST NOT exist
- AND no route in `routes/web.php` MUST reference `welcome`

### Requirement: Footer Visual Treatment

The landing page footer MUST use a clean background treatment with no placeholder links.

#### Scenario: Footer has readable contrast

- GIVEN the landing page footer is rendered
- THEN the background MUST be `bg-muted` or `bg-card` (not `bg-foreground`)
- AND text MUST have sufficient contrast against the background
- AND all links MUST point to valid routes (no `href="#"` placeholders)
