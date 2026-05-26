# Delta for UI — theme-contrast

## Purpose

Replace hardcoded Tailwind gray utilities with semantic CSS tokens across UI components to fix WCAG AA contrast failures and ensure proper dark mode rendering.

## ADDED Requirements

### Requirement: nav-link-semantic

NavLink component SHALL use semantic tokens for all navigation link states.

The component MUST use `text-foreground` for active link text, `border-primary` for active border, `text-muted-foreground` for inactive text, and `border-transparent` with `hover:border-border` for inactive hover state.

#### Scenario: Active nav link renders with semantic tokens

- GIVEN a user is on a page matching the nav link's URL
- WHEN the NavLink component renders
- THEN the link displays `text-foreground` and `border-primary`
- AND the link is visually distinct as the active route

#### Scenario: Inactive nav link renders with semantic tokens

- GIVEN a user is on a page NOT matching the nav link's URL
- WHEN the NavLink component renders
- THEN the link displays `text-muted-foreground` and `border-transparent`
- AND on hover, displays `hover:text-foreground` and `hover:border-border`

### Requirement: modal-semantic

Modal component SHALL use semantic tokens for overlay and card backgrounds.

The overlay MUST use `bg-black/50` for the backdrop. The modal card MUST use `bg-card` for the content container.

#### Scenario: Modal overlay uses dark backdrop

- GIVEN a modal is open
- WHEN the overlay renders
- THEN the backdrop displays `bg-black/50`
- AND provides sufficient contrast against underlying content

#### Scenario: Modal card uses card background

- GIVEN a modal is open
- WHEN the card container renders
- THEN the card displays `bg-card`
- AND is visually elevated from the overlay

### Requirement: dropdown-semantic

Dropdown menu items SHALL use semantic tokens for text and hover states.

Menu items MUST use `text-foreground` for text color and `hover:bg-muted` for hover background.

#### Scenario: Dropdown menu item renders with semantic tokens

- GIVEN a dropdown menu is open
- WHEN menu items render
- THEN each item displays `text-foreground`
- AND on hover displays `hover:bg-muted`

### Requirement: tech-showcase-semantic

Tech showcase badges SHALL use semantic tokens with proper dark mode variants.

Badges MUST use `bg-muted text-foreground` for light mode and `dark:bg-muted dark:text-muted-foreground` for dark mode.

#### Scenario: Tech badge renders with proper contrast in light mode

- GIVEN a tech badge displays on light mode
- WHEN the component renders
- THEN the badge shows `bg-muted text-foreground`
- AND text contrast meets WCAG AA

#### Scenario: Tech badge renders with proper contrast in dark mode

- GIVEN a tech badge displays on dark mode
- WHEN the component renders
- THEN the badge shows `dark:bg-muted dark:text-muted-foreground`
- AND text contrast meets WCAG AA

### Requirement: auth-pages-text-colors

Auth page text colors SHALL use semantic tokens instead of hardcoded gray utilities.

Auth pages MUST use `text-muted-foreground` for secondary text instead of `text-gray-600`.

#### Scenario: Auth page uses muted text color

- GIVEN a user views an auth page (forgot-password, confirm-password, or verify-email)
- WHEN the page renders
- THEN secondary text displays `text-muted-foreground`
- AND maintains proper contrast in both light and dark modes

### Requirement: success-messages-dark-mode

Success message text colors SHALL include dark mode variants for visibility.

Success messages using `text-green-600` MUST also include `dark:text-green-400` for dark mode visibility.

#### Scenario: Success message visible in dark mode

- GIVEN a user views a success message on an auth page
- WHEN dark mode is active
- THEN the success text displays `dark:text-green-400`
- AND remains visible with sufficient contrast

## MODIFIED Requirements

No existing UI spec requirements are being modified — this is an initial UI spec covering theme-contrast changes.

## REMOVED Requirements

None.

## Summary

| Component | Token Mapping |
|-----------|---------------|
| nav-link.tsx | Active: `text-foreground`, `border-primary` / Inactive: `text-muted-foreground`, `border-transparent`, `hover:border-border` |
| responsive-nav-link.tsx | `text-muted-foreground`, `hover:border-border`, `bg-primary/10` |
| modal.tsx | Overlay: `bg-black/50` / Card: `bg-card` |
| dropdown.tsx | `text-foreground`, `hover:bg-muted` |
| tech-showcase.tsx | Light: `bg-muted text-foreground` / Dark: `dark:bg-muted dark:text-muted-foreground` |
| Auth pages | `text-muted-foreground` for gray-600 text |
| Auth pages | `text-green-600 dark:text-green-400` for success messages |
| welcome.tsx | `bg-muted`, `text-muted-foreground` |

## Test Scenarios

1. NavLink active state uses `text-foreground` and `border-primary`
2. Modal overlay is `bg-black/50` and card is `bg-card`
3. Tech showcase badges have proper contrast in both light and dark mode
4. Auth page success messages visible in dark mode