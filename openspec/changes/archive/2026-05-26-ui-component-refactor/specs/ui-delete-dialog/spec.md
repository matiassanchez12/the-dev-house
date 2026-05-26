# Spec: ui-delete-dialog

## Purpose

Replace blocking `window.confirm()` calls with accessible, non-blocking shadcn `Dialog` components for destructive actions. This improves UX by allowing users to review confirmation details before acting, supports keyboard navigation, and provides proper ARIA attributes for screen readers.

## Requirements

### REQ-1: Project Deletion Dialog

The system SHALL replace the `window.confirm()` call in the project show page with a shadcn `Dialog` component. The dialog SHALL display a clear warning message about permanent deletion and provide Cancel and Confirm actions.

**Target**: `resources/js/pages/projects/show.tsx` — line 33: `confirm('¿Estás seguro de que querés eliminar este proyecto?')`

#### Scenarios

- GIVEN a user is viewing a project they own WHEN they click the delete project button THEN a shadcn `Dialog` SHALL open with a warning message about permanent deletion AND the dialog SHALL have Cancel and Delete buttons
- GIVEN the delete confirmation dialog is open WHEN the user clicks Cancel THEN the dialog SHALL close AND the project SHALL NOT be deleted AND the user SHALL remain on the project page
- GIVEN the delete confirmation dialog is open WHEN the user clicks Delete THEN the project deletion request SHALL be sent AND the dialog SHALL close AND the user SHALL be redirected to the projects list
- GIVEN the delete confirmation dialog is open WHEN the user presses Escape THEN the dialog SHALL close AND the deletion SHALL NOT occur
- GIVEN the delete confirmation dialog is open WHEN the user presses Tab THEN focus SHALL cycle within the dialog elements (trap focus) AND the dialog SHALL be accessible via screen reader

### REQ-2: Account Deletion Dialog Consistency

The system SHALL ensure the account deletion dialog in `delete-user-form.tsx` uses shadcn `Dialog` components consistently. The existing Dialog usage SHALL be migrated to use shadcn `Button` variants for the action buttons (already uses Dialog, but buttons need migration per ui-button-migration spec).

**Target**: `resources/js/pages/profile/partials/delete-user-form.tsx`

#### Scenarios

- GIVEN the account deletion dialog is open WHEN the dialog renders THEN the Cancel button SHALL use `Button` with `variant="secondary"` AND the Delete button SHALL use `Button` with `variant="destructive"`
- GIVEN the account deletion form is displayed WHEN the user clicks "Delete Account" THEN the existing Dialog SHALL open (no `confirm()` call) AND the password input SHALL be focused

### REQ-3: No Remaining confirm() Calls

After migration, the codebase SHALL NOT contain any `window.confirm()` or `alert()` calls used for delete confirmation purposes.

#### Scenarios

- GIVEN the delete dialog migration is complete WHEN a content search is performed for `window.confirm(` in `resources/js/` THEN zero matches SHALL be found
- GIVEN the delete dialog migration is complete WHEN a content search is performed for `confirm(` in `resources/js/` THEN zero matches SHALL be found for delete-related confirmations
