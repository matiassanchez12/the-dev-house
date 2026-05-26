# Delta for ui-dropdown — Visual Styling Requirements

## MODIFIED Requirements

### Requirement: ui-dropdown — Accessible Dropdown Menu

The system SHALL provide an accessible dropdown menu component built on `@radix-ui/react-dropdown-menu`. The dropdown MUST support full keyboard navigation and proper ARIA attributes for screen reader compatibility.

The dropdown SHALL be triggered by a user action (click or Enter/Space on a trigger element) and SHALL close when the user presses Escape, clicks outside, or navigates to a menu item.

**Visual Styling**: The dropdown content panel MUST have visible background, elevation, border, and spacing. The content panel SHALL display with:
- `bg-card` background color
- `shadow-md` for elevation
- `rounded-lg` for border radius
- `border border-border` for subtle border
- `min-w-[8rem]` for minimum width
- `p-1` for padding between items

(Previously: accessibility-only spec with no visual styling requirements defined)

#### Scenario: Dropdown opens with visible panel

- GIVEN a dropdown trigger button is visible and focused WHEN the user clicks the trigger button THEN the dropdown menu SHALL open immediately below the trigger AND the content panel SHALL have visible `card` background with `shadow-md` AND border AND rounded corners AND focus SHALL remain on the trigger button AND the menu SHALL be visible with proper positioning

#### Scenario: Dropdown keyboard navigation

- GIVEN a dropdown trigger button is visible and focused WHEN the user presses Enter or Space THEN the dropdown menu SHALL open AND the first menu item SHALL automatically receive focus AND the trigger SHALL remain focused

#### Scenario: Dropdown arrow key navigation

- GIVEN an open dropdown menu with focus on the first item WHEN the user presses Arrow Down THEN focus SHALL move to the next menu item AND focus SHALL wrap to the first item when reaching the end WHEN the user presses Arrow Up THEN focus SHALL move to the previous menu item AND focus SHALL wrap to the last item when reaching the beginning

#### Scenario: Dropdown closes on Escape

- GIVEN an open dropdown menu WHEN the user presses Escape THEN the dropdown SHALL close AND focus SHALL return to the trigger button

#### Scenario: Dropdown item selection

- GIVEN an open dropdown menu with focus on a menu item WHEN the user presses Enter THEN the menu item SHALL be selected AND the dropdown SHALL close AND focus SHALL return to the trigger button

#### Scenario: Dropdown closes on outside click

- GIVEN an open dropdown menu WHEN the user clicks anywhere outside the dropdown menu THEN the dropdown SHALL close

#### Scenario: Dropdown styled in dark mode

- GIVEN the application has dark mode enabled AND a dropdown is opened WHEN the user triggers the dropdown THEN the content panel SHALL use theme-aware `bg-card` and `border-border` values that adapt to dark mode
