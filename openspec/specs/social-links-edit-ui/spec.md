# Social Links Edit UI Specification

## Purpose

Defines the UI for managing social media links on the profile edit page (`/profile/edit`). Users can add, edit, and remove social links with a platform selector and URL input. Depends on `social-links-onboarding` SDD for backend endpoints.

## Requirements

### Requirement: Social Link Icon Registry

The system SHALL provide a shared icon registry at `resources/js/lib/social-icons.ts` that maps platform slugs to inline SVG icons and display labels.

Supported platforms: `github`, `linkedin`, `twitter`, `youtube`, `website`, `discord`, `stackoverflow`.

The registry SHALL export:
- `getSocialIcon(slug: string): React.ReactNode` — returns SVG icon for platform
- `getSocialLabel(slug: string): string` — returns human-readable label
- `SOCIAL_PLATFORMS: Array<{ slug: string; label: string }>` — ordered list for dropdown

#### Scenario: returns correct icon for known platform

- GIVEN `getSocialIcon('github')` is called
- THEN returns GitHub SVG icon as React node

#### Scenario: returns correct label for known platform

- GIVEN `getSocialLabel('linkedin')` is called
- THEN returns `"LinkedIn"`

#### Scenario: returns fallback for unknown platform

- GIVEN `getSocialIcon('unknown')` is called
- THEN returns a generic link icon
- AND `getSocialLabel('unknown')` returns the slug capitalized

### Requirement: Social Links Edit Form

The system SHALL provide a `SocialLinksForm` component at `resources/js/components/profile/social-links-form.tsx` that allows users to add, edit, and remove social links with dynamic rows.

Each row SHALL contain:
- Platform selector (dropdown using `SOCIAL_PLATFORMS`)
- URL input (text field with `type="url"`)
- Remove button (visible only for existing links, not for unsaved new rows)

The form SHALL support:
- Adding new empty rows via an "Add link" button
- Removing rows before saving
- Editing existing link URLs
- Submitting all changes via Inertia form to the social links endpoint

#### Scenario: user adds a new social link

- GIVEN user clicks "Add link" button
- THEN a new empty row appears with platform dropdown and URL input
- AND the row has no remove button (unsaved)

#### Scenario: user removes an existing social link

- GIVEN user clicks remove button on a saved link row
- THEN the row is marked for deletion in the form state
- AND on submit, a DELETE request is sent for that link

#### Scenario: user edits an existing social link URL

- GIVEN a saved link row with URL `https://github.com/user`
- WHEN user changes URL to `https://github.com/new-user`
- AND submits the form
- THEN an UPDATE request is sent with the new URL

#### Scenario: form submits all changes at once

- GIVEN user added 1 new link, edited 1 existing, removed 1
- WHEN user clicks "Save"
- THEN a single POST/PUT request is sent with all changes
- AND success toast is shown on completion

### Requirement: Profile Edit Page Integration

The system SHALL integrate `SocialLinksForm` into `resources/js/pages/profile/edit.tsx` as a new section card below the existing profile sections.

The section SHALL:
- Be titled "Redes sociales"
- Only render if the `socialLinks` prop is present (gate behind dependency)
- Use the same card styling as existing sections (`bg-card p-4 shadow sm:rounded-lg sm:p-8`)

#### Scenario: social links section renders on edit page

- GIVEN `socialLinks` prop exists in page props
- WHEN user navigates to `/profile/edit`
- THEN "Redes sociales" section is visible with the form

#### Scenario: social links section hidden when dependency not ready

- GIVEN `socialLinks` prop is undefined or null
- WHEN user navigates to `/profile/edit`
- THEN no social links section is rendered (no error, no empty state)

### Requirement: TypeScript Types for Social Links

The system SHALL extend TypeScript types in `resources/js/types/index.ts` with:

```typescript
export interface SocialLink {
    id?: number;
    platform: string;
    url: string;
    _destroy?: boolean;  // marker for deletion
}
```

The `UserProfile` interface SHALL include:
```typescript
socialLinks?: SocialLink[];
```

The profile edit page props SHALL include:
```typescript
socialLinks: SocialLink[];
```

#### Scenario: SocialLink type is available for import

- GIVEN any component imports `SocialLink` from `@/types`
- THEN the type resolves with `id`, `platform`, `url`, and optional `_destroy` fields
