# Delta for Profile

## ADDED Requirements

### Requirement: Compile-safe profile page props
The profile edit page MUST use TypeScript-safe page props for `techs` and `userTechs` so profile data is accessed without unsafe casts or `unknown[]` assignments.

#### Scenario: Profile edit props are typed
- GIVEN the profile edit page receives tech and user-tech data
- WHEN TypeScript checks `resources/js/pages/profile/edit.tsx`
- THEN the page compiles without errors for `techs` and `userTechs`

#### Scenario: Invalid `unknown[]` props are rejected
- GIVEN a profile edit implementation still treats `techs` or `userTechs` as `unknown[]`
- WHEN TypeScript validates the page
- THEN the code fails compilation until the props are narrowed to concrete profile types

### Requirement: Compile-safe profile refs and handlers
The profile forms MUST declare input refs and form event handlers with explicit TypeScript types so strict compilation succeeds without implicit `any` or unknown ref errors.

#### Scenario: Ref and handler types compile
- GIVEN the delete password and update password forms define input refs
- WHEN TypeScript checks the profile partials
- THEN refs are accepted as input-element refs and submit handlers are accepted as form events

#### Scenario: Untyped handlers are not allowed
- GIVEN a profile form omits ref initialization or event parameter types
- WHEN the file is compiled under strict TypeScript rules
- THEN the compiler reports an error until the ref and handler types are explicit

### Requirement: Compile-safe profile fixtures
The profile complete-form test fixtures MUST include all required profile data fields so the test file compiles against the current `UserTech` and `Tech` shapes.

#### Scenario: Complete fixtures compile
- GIVEN the profile complete-form test creates mock `UserTech` and `Tech` records
- WHEN TypeScript checks the test file
- THEN the mocks include all required fields and the test compiles

#### Scenario: Missing required fixture fields fail compile
- GIVEN a mock profile fixture omits required timestamp fields
- WHEN TypeScript validates the test
- THEN compilation fails until the fixture matches the required model shape

### Requirement: Null-safe profile select handling
The profile social-links editor MUST treat a cleared select value as an empty string before updating profile link state.

#### Scenario: Cleared select value is accepted
- GIVEN a social link platform select is cleared
- WHEN the change handler receives a nullish value
- THEN the handler passes a string value to the profile update path

#### Scenario: Null select value is not forwarded directly
- GIVEN the select component emits `null` for an empty choice
- WHEN the profile form updates the link field
- THEN the code must not pass `null` into a string-only update function
