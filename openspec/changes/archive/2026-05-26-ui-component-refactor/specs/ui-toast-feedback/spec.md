# Spec: ui-toast-feedback

## Purpose

Add `sonner` toast notifications to provide immediate visual feedback after API operations (project CRUD, join request actions, profile updates, account deletion). Currently, users receive no feedback after successful operations, creating uncertainty about whether their action was processed.

## Requirements

### REQ-1: Sonner Installation and Configuration

The system SHALL install the `sonner` npm package and configure the `<Toaster />` component in the root application layout. The toaster SHALL be positioned to display notifications without obscuring primary content.

#### Scenarios

- GIVEN the `sonner` package is installed WHEN `<Toaster />` is added to the root layout THEN toast notifications SHALL be renderable across all pages
- GIVEN dark mode is enabled WHEN a toast notification appears THEN the toast SHALL use theme-aware styling (dark background, light text)
- GIVEN the application is running WHEN no toast is active THEN the `<Toaster />` component SHALL NOT render any visible UI

### REQ-2: Project CRUD Toast Feedback

The system SHALL display toast notifications after project create, update, and delete operations. Success toasts SHALL indicate the operation completed. Error toasts SHALL indicate what went wrong.

**Targets**: Project form submission handlers in project create/edit pages and project show page (delete action).

#### Scenarios

- GIVEN a user creates a new project WHEN the project is successfully saved THEN a success toast SHALL appear with a message indicating the project was created AND the toast SHALL auto-dismiss after a reasonable duration (~4 seconds)
- GIVEN a user updates an existing project WHEN the project is successfully saved THEN a success toast SHALL appear with a message indicating the project was updated
- GIVEN a user deletes a project WHEN the deletion is successful THEN a success toast SHALL appear with a message indicating the project was deleted AND the user SHALL be redirected to the projects list
- GIVEN a project operation fails (e.g., validation error, server error) WHEN the error occurs THEN an error toast SHALL appear with a message describing the failure

### REQ-3: Join Request Action Toast Feedback

The system SHALL display toast notifications after join request approve, reject, and cancel operations.

**Targets**: Join request action handlers in project show page or join request management UI.

#### Scenarios

- GIVEN a project owner approves a join request WHEN the approval is successful THEN a success toast SHALL appear with a message indicating the request was approved
- GIVEN a project owner rejects a join request WHEN the rejection is successful THEN a success toast SHALL appear with a message indicating the request was rejected
- GIVEN a user cancels their join request WHEN the cancellation is successful THEN a success toast SHALL appear with a message indicating the request was cancelled
- GIVEN a join request action fails WHEN the error occurs THEN an error toast SHALL appear with a message describing the failure

### REQ-4: Profile Update Toast Feedback

The system SHALL display toast notifications after profile information update, password change, and avatar operations.

**Targets**: Profile form submission handlers in profile pages.

#### Scenarios

- GIVEN a user updates their profile information WHEN the update is successful THEN a success toast SHALL appear with a message indicating the profile was saved
- GIVEN a user changes their password WHEN the change is successful THEN a success toast SHALL appear with a message indicating the password was updated
- GIVEN a user deletes their account WHEN the deletion is successful THEN a success toast SHALL NOT be required (user is redirected away) BUT if the deletion fails THEN an error toast SHALL appear with a message describing the failure

### REQ-5: Toast Behavior and Accessibility

Toast notifications SHALL be accessible to screen readers and SHALL not interfere with keyboard navigation.

#### Scenarios

- GIVEN a toast notification appears WHEN a screen reader is active THEN the toast content SHALL be announced to the user via ARIA live region
- GIVEN multiple toast notifications are triggered in rapid succession WHEN toasts are displayed THEN toasts SHALL stack or queue without overlapping in a way that obscures content
- GIVEN a toast notification is visible WHEN the user does not interact with it THEN the toast SHALL auto-dismiss after a default duration (~4 seconds for success, ~7 seconds for errors)
