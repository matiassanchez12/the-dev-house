# Delta for App: Form Accessibility Shadcn Foundation

This delta covers the remaining Slice 3 forms only: onboarding and profile-complete.

## ADDED Requirements

### Requirement: Remaining form slice MUST use accessible shadcn/ui controls

The system MUST render onboarding and profile-complete fields with programmatic labels, stable error wiring, and shadcn/ui primitives.
Invalid fields MUST set `aria-invalid="true"` and connect to visible error content via `aria-describedby`.
Form errors MUST be announced to assistive technology.

#### Scenario: Invalid onboarding submission is announced
- GIVEN onboarding form data contains validation errors
- WHEN the user submits the form
- THEN the first invalid field is marked invalid
- AND the related error message is announced

#### Scenario: Profile-complete fields stay labeled
- GIVEN the profile-complete form renders without validation errors
- WHEN the user views the form
- THEN each control has a programmatic label
- AND no error-only description is emitted

### Requirement: Remaining slice MUST preserve existing onboarding flow behavior

The system MUST keep the current onboarding step sequence, endpoints, and validation contracts unchanged while updating only form presentation and accessibility.
The system MUST keep the profile-complete submission contract unchanged.

#### Scenario: Onboarding step navigation is unchanged
- GIVEN a user completes the onboarding form successfully
- WHEN the form submits
- THEN the same next step is reached as before

#### Scenario: Profile-complete submit contract is unchanged
- GIVEN valid profile-complete data
- WHEN the form submits
- THEN the existing request path and validation contract still apply

### Requirement: Profile-complete composite controls MUST remain accessible

The system MUST render grouped profile-complete sections with accessible accordion semantics and proficiency inputs with accessible slider semantics.

#### Scenario: Grouped content is expandable
- GIVEN a profile-complete group is collapsed
- WHEN the user expands it
- THEN the content becomes visible without losing labels

#### Scenario: Proficiency control remains accessible
- GIVEN a profile-complete proficiency value is adjusted
- WHEN the slider changes
- THEN the selected value remains associated with its label and error state
