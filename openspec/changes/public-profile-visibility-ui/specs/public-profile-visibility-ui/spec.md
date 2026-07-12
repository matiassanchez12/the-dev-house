# Delta for Public Profile Visibility UI

## Purpose

Define how the public user profile renders backend-provided privacy data so visitors can distinguish intentionally hidden information from genuinely empty content. This change is frontend-only.

## ADDED Requirements

### Requirement: Contact Fields Respect Backend Visibility

The public profile SHALL render email and phone only when the backend includes those fields in `UserProfile`.

When a contact field is absent, the UI SHALL show a clear privacy-aware explanation instead of silently omitting the row.

#### Scenario: email is shown when provided

- GIVEN the backend includes `email` in `UserProfile`
- WHEN a visitor opens the public profile
- THEN the email address is rendered in the profile header

#### Scenario: phone is shown when provided

- GIVEN the backend includes `phone` in `UserProfile`
- WHEN a visitor opens the public profile
- THEN the phone number is rendered in the profile header

#### Scenario: missing contact data shows a privacy explanation

- GIVEN the backend omits `email` or `phone`
- WHEN a visitor opens the public profile
- THEN the UI shows a visible privacy-aware explanation for the missing contact field
- AND the contact row does not appear blank

### Requirement: Privacy-Aware Activity Empty State

When project activity is hidden by privacy and both project arrays are empty, `ProjectShowcase` SHALL render a privacy-aware empty state instead of the normal no-projects message.

This behavior SHALL apply to the overall project section empty state.

#### Scenario: hidden activity shows a privacy empty state

- GIVEN `showActivity` is false
- AND `createdProjects` and `participatingProjects` are empty
- WHEN a visitor opens the public profile
- THEN the project section shows a privacy-aware empty state

### Requirement: Genuine Empty States Remain Normal

When activity is not hidden by privacy, empty project sections SHALL render the normal empty state for a genuinely empty profile.

#### Scenario: genuinely empty profile shows the normal empty state

- GIVEN `showActivity` is true or unspecified
- AND both project arrays are empty
- WHEN a visitor opens the public profile
- THEN the standard no-projects empty state is shown

### Requirement: Frontend Tests Prove Visibility Distinctions

The `resources/js/pages/users/show.test.tsx` suite SHALL verify the difference between:

- contact values that are present versus absent
- privacy-driven empty project states versus genuinely empty project states

#### Scenario: tests cover all visibility paths

- GIVEN the public profile test suite runs
- WHEN assertions are evaluated
- THEN separate cases prove shown, hidden, privacy-empty, and normal-empty rendering
