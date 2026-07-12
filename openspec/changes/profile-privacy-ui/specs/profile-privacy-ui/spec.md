# Profile Privacy UI Specification

## Purpose

Defines the `/profile/edit` privacy settings slice for contact and visibility controls. This spec covers only the profile form needs for phone and privacy preferences.

## Requirements

### Requirement: Preload privacy state on profile edit

The profile edit page SHALL render the current phone value and privacy settings from page props.

The page SHALL treat `phone` as the editable contact value and `privacySetting` as the source of truth for `show_email`, `show_phone`, `is_discoverable`, and `show_activity`.

#### Scenario: current values are shown on load

- GIVEN the page props include `phone` and `privacySetting`
- WHEN the user opens `/profile/edit`
- THEN the form shows the current phone value
- AND each privacy control reflects the matching prop value

#### Scenario: missing phone is still editable

- GIVEN the current phone prop is empty or null
- WHEN the user opens `/profile/edit`
- THEN the phone field is shown as empty
- AND the user can enter a new value

### Requirement: Edit phone from the profile form only

The profile edit form SHALL allow the user to set or clear an optional phone number from this screen only.

The phone field SHALL accept a blank value and SHALL preserve the rest of the privacy settings unchanged.

#### Scenario: user clears the phone field

- GIVEN the form is loaded with an existing phone value
- WHEN the user clears the phone field and submits
- THEN the request is sent with an empty phone value handled as optional
- AND the other privacy values remain selected

### Requirement: Toggle privacy visibility controls

The form SHALL provide controls for `show_email`, `show_phone`, `is_discoverable`, and `show_activity`.

Each control SHALL have helper copy that explains what the setting affects so the user can understand the visibility impact before saving.

#### Scenario: user changes multiple privacy toggles

- GIVEN the form is loaded with all four privacy values
- WHEN the user toggles any combination of the controls
- THEN the form state updates for those controls
- AND the helper copy remains visible next to each control

#### Scenario: helper copy explains the effect of a control

- GIVEN the user focuses or views a privacy control
- WHEN the control is rendered
- THEN the UI includes text describing what becomes visible or hidden

### Requirement: Submit privacy changes and show feedback

The form SHALL submit to the existing privacy endpoint with the phone value and all four privacy fields.

On success, the UI SHALL reflect the saved state.
On validation or request failure, the UI SHALL surface the error state without losing the current form inputs.

#### Scenario: successful save updates the UI state

- GIVEN the user changes phone or privacy toggles
- WHEN the user submits the form successfully
- THEN the privacy request is sent to the existing endpoint
- AND the UI shows success feedback

#### Scenario: request fails with server errors

- GIVEN the server returns validation or request errors
- WHEN the user submits the form
- THEN the UI shows the error message(s)
- AND the entered values remain in the form

### Requirement: Surface invalid phone format inline

The form SHALL show an inline error when the phone value does not meet accepted format rules.

#### Scenario: invalid phone is rejected in the UI

- GIVEN the user enters a phone value in an invalid format
- WHEN the form is submitted
- THEN the phone field shows an error message
- AND the form does not present the change as successful
