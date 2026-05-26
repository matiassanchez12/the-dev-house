# Delta for shadcn-migration: UI Component Migration

## Summary

Replace `@headlessui/react` modal and dropdown components with shadcn/ui equivalents. The dropdown migration introduces a new accessible `ui-dropdown` capability with full keyboard navigation support.

---

## ADDED Requirements

### Requirement: ui-dropdown — Accessible Dropdown Menu

The system SHALL provide an accessible dropdown menu component built on `@radix-ui/react-dropdown-menu`. The dropdown MUST support full keyboard navigation and proper ARIA attributes for screen reader compatibility.

The dropdown SHALL be triggered by a user action (click or Enter/Space on a trigger element) and SHALL close when the user presses Escape, clicks outside, or navigates to a menu item.

#### Scenario: Open dropdown with mouse click

- GIVEN a dropdown trigger button is visible and focused
- WHEN the user clicks the trigger button
- THEN the dropdown menu SHALL open immediately below the trigger
- AND focus SHALL remain on the trigger button
- AND the menu SHALL be visible with proper positioning

#### Scenario: Open dropdown with keyboard

- GIVEN a dropdown trigger button is visible and focused
- WHEN the user presses Enter or Space
- THEN the dropdown menu SHALL open
- AND the first menu item SHALL automatically receive focus
- AND the trigger SHALL remain focused

#### Scenario: Navigate menu items with arrow keys

- GIVEN an open dropdown menu with focus on the first item
- WHEN the user presses Arrow Down
- THEN focus SHALL move to the next menu item
- AND focus SHALL wrap to the first item when reaching the end
- WHEN the user presses Arrow Up
- THEN focus SHALL move to the previous menu item
- AND focus SHALL wrap to the last item when reaching the beginning

#### Scenario: Close dropdown with Escape

- GIVEN an open dropdown menu
- WHEN the user presses Escape
- THEN the dropdown SHALL close
- AND focus SHALL return to the trigger button

#### Scenario: Select menu item with Enter

- GIVEN an open dropdown menu with focus on a menu item
- WHEN the user presses Enter
- THEN the menu item SHALL be selected
- AND the dropdown SHALL close
- AND focus SHALL return to the trigger button

#### Scenario: Close dropdown by clicking outside

- GIVEN an open dropdown menu
- WHEN the user clicks anywhere outside the dropdown menu
- THEN the dropdown SHALL close

---

## REMOVED Requirements

### Requirement: custom-dropdown — Custom Dropdown Component

(Reason: Replaced by shadcn/ui `ui-dropdown` built on `@radix-ui/react-dropdown-menu` for improved accessibility and reduced code duplication)

#### Scenario: Custom dropdown no longer used

- GIVEN the shadcn-migration change is complete
- WHEN any component requires a dropdown menu
- THEN the system SHALL use `ui-dropdown` (Radix-based)
- AND `resources/js/components/dropdown.tsx` SHALL be removed

### Requirement: custom-modal — Custom Modal Component

(Reason: Replaced by shadcn/ui `ui/dialog` (`@base-ui/react`) for improved accessibility and consistency)

#### Scenario: Custom modal no longer used

- GIVEN the shadcn-migration change is complete
- WHEN any component requires a modal dialog
- THEN the system SHALL use `ui/dialog`
- AND `resources/js/components/modal.tsx` SHALL be removed

---

## Unchanged Behaviors

The following capabilities remain unchanged (implementation-only migration):

| Component | Behavior |
|-----------|----------|
| `ui/dialog` | Existing shadcn dialog component used for modals (already installed) |
| `ui/avatar` | Existing shadcn avatar components used for profile images (already installed) |
| `Progress` | New shadcn Progress component replaces inline div (new install) |

---

## Migration Checklist

- [ ] `resources/js/components/dropdown.tsx` removed
- [ ] `resources/js/components/modal.tsx` removed
- [ ] `@headlessui/react` uninstalled (if no other usages)
- [ ] `ui/dialog` used for all modal implementations
- [ ] `ui-dropdown` used for all dropdown implementations
- [ ] `ui/avatar` used in profile form
- [ ] `Progress` component used in onboarding layout
