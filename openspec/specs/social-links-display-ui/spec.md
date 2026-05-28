# Social Links Display UI Specification

## Purpose

Defines the UI for displaying social media links on public user profiles (`/users/{slug}`). Links render as icon buttons with platform-specific SVG icons and hover effects. Only platforms with configured URLs are shown.

## Requirements

### Requirement: Social Links Display Row

The system SHALL provide a `SocialLinksRow` component at `resources/js/components/user/social-links-row.tsx` that renders social links as a horizontal row of icon buttons.

Each link SHALL:
- Display the platform's SVG icon from the shared icon registry
- Be an anchor (`<a>`) with `href` set to the link URL
- Open in a new tab (`target="_blank"`, `rel="noopener noreferrer"`)
- Have `aria-label` set to the platform label (e.g., "GitHub profile")
- Apply hover effects: color change to primary color and subtle scale transform

The row SHALL:
- Render links horizontally with consistent spacing (`gap-3`)
- Use icon size of `size-5` (20px)
- Not render if the links array is empty

#### Scenario: renders links with correct icons and labels

- GIVEN user has GitHub and LinkedIn links
- THEN two icon buttons render with correct SVGs
- AND each has `aria-label="GitHub profile"` and `aria-label="LinkedIn profile"`

#### Scenario: hover effects apply on mouse over

- GIVEN a social link icon is displayed
- WHEN user hovers over it
- THEN icon color changes to primary color
- AND icon scales up subtly (`hover:scale-110`)

#### Scenario: links open in new tab

- GIVEN user clicks a social link
- THEN the URL opens in a new browser tab
- AND `rel="noopener noreferrer"` is set for security

#### Scenario: empty links array renders nothing

- GIVEN `links` prop is an empty array
- THEN the component returns null (no DOM output)

### Requirement: Public Profile Integration

The system SHALL integrate `SocialLinksRow` into the public profile page, positioned below the user's name and bio in the `UserProfileHeader` component.

The `UserProfileHeader` SHALL:
- Accept an optional `socialLinks?: SocialLink[]` prop
- Render `SocialLinksRow` below the bio text when links exist
- Not render any social links section when links are empty or undefined

The `users/show.tsx` page SHALL:
- Pass `user.socialLinks` to `UserProfileHeader`
- Handle the case where `socialLinks` is undefined (dependency not ready)

#### Scenario: social links visible on public profile

- GIVEN user has configured social links
- WHEN visitor navigates to `/users/{slug}`
- THEN social link icons appear below the user's bio

#### Scenario: no social links section for user without links

- GIVEN user has no social links configured
- WHEN visitor navigates to `/users/{slug}`
- THEN no social links row or placeholder is visible

#### Scenario: non-owner cannot edit social links

- GIVEN visitor views another user's profile
- THEN social links are displayed as read-only icon buttons
- AND no edit controls are visible

### Requirement: Controller Data Integration

The system SHALL ensure social links are included in page props:

- `UserController@show()` SHALL include `socialLinks` in the `UserProfile` data
- `ProfileController@edit()` SHALL include `socialLinks` in the edit page props

Both controllers SHALL load social links via the `SocialLink` model relationship.

#### Scenario: show page includes social links

- GIVEN user has 2 social links in the database
- WHEN `UserController@show()` is called
- THEN the Inertia response includes `user.socialLinks` with platform and URL

#### Scenario: edit page includes social links

- GIVEN authenticated user has social links
- WHEN `ProfileController@edit()` is called
- THEN the Inertia response includes `socialLinks` array for the form
