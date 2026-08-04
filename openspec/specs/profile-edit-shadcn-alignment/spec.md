# Profile Edit Shadcn Alignment Specification

## Purpose

Normalize the first profile-edit scope to shadcn/ui section shells and accessible dialog structure without changing submission flows or page routes.

## Requirements

### Requirement: Scope-1 profile forms MUST use a single shadcn section shell

`update-profile-information-form.tsx` and `update-password-form.tsx` MUST render their content as a single self-contained shadcn `Card` section with header, content, and footer regions.
Their internal form layout MUST use flex-column gap spacing instead of `space-y-*`.

#### Scenario: profile forms render as self-contained sections
- GIVEN the profile edit page renders the scope-1 forms
- WHEN a user views the page
- THEN each form appears as one card-like section with a visible title and description

#### Scenario: form layout remains accessible and consistent
- GIVEN a scope-1 form is focused or inspected by assistive tech
- WHEN its fields are read in order
- THEN the form content is grouped within one section shell
- AND the spacing between controls remains consistent without changing the form behavior

### Requirement: Scope-1 page wrapper MUST not add duplicate card chrome

`edit.tsx` MUST not wrap the scope-1 partials in additional raw `bg-card` section wrappers.
The page MAY continue to arrange the partials, but the partials themselves MUST own the visible section chrome.

#### Scenario: page does not duplicate section framing
- GIVEN the profile edit page renders the scope-1 partials
- WHEN the DOM is inspected
- THEN there is no extra raw wrapper duplicating the card chrome around those partials

### Requirement: Delete-user dialog MUST expose an accessible title

`delete-user-form.tsx` MUST include a programmatic dialog title for the account deletion confirmation.
The dialog MUST continue to support canceling without deleting the account.

#### Scenario: dialog has an accessible name
- GIVEN a user opens the delete account dialog
- WHEN assistive technology reads the dialog
- THEN the dialog has a title available to screen readers

#### Scenario: cancel still dismisses the dialog
- GIVEN the delete account dialog is open
- WHEN the user cancels or dismisses it
- THEN the dialog closes
- AND the account is not deleted
