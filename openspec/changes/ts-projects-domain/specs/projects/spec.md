# Delta for Projects

## ADDED Requirements

### Requirement: compile-safe project status manager

The system MUST keep the project status manager type-safe with the full project status union plus an `all` filter. TypeScript compilation MUST succeed without invalid record keys, unsafe casts, or implicit-`any` status iterations.

#### Scenario: status filters compile

- GIVEN the status manager defines filters for every project status
- WHEN the status map is type-checked
- THEN the code MUST compile with an `all` entry and no missing-key errors

#### Scenario: status iteration stays typed

- GIVEN the UI renders transitions from the status map
- WHEN the callback iterates available statuses
- THEN TypeScript MUST infer a project status type and not report implicit `any`

### Requirement: compile-safe nullable Select handlers

The system MUST accept nullable values from project Select components and normalize `null` to an empty selection without changing filter behavior. TypeScript compilation MUST succeed against the Base UI `onValueChange(value: string | null, ...)` signature.

#### Scenario: selecting an option compiles

- GIVEN a user picks a project filter option
- WHEN the Select handler receives a string value
- THEN the handler MUST compile and update the filter state

#### Scenario: clearing a selection compiles

- GIVEN a user clears the Select value
- WHEN the handler receives `null`
- THEN the code MUST compile and normalize the state to an empty selection

### Requirement: compile-safe projects/show page props

The system MUST type the projects/show page props to match the page payload actually provided by the app. Partial auth-user data and optional join-request messages MUST compile without unsafe assertions or fake placeholder fields.

#### Scenario: guest or partial auth data compiles

- GIVEN the show page receives no authenticated user or a nullable auth user
- WHEN the page props are type-checked
- THEN TypeScript MUST accept the payload shape

#### Scenario: viewer join request compiles without message

- GIVEN a viewer join request exists without a message value
- WHEN the show page props are type-checked
- THEN TypeScript MUST accept the join request shape

### Requirement: compile-safe project test fixtures

The system MUST define project test fixtures with every field required by their declared types. Test-only globals such as `route` MUST also be declared so project tests compile cleanly.

#### Scenario: collaborator fixtures compile

- GIVEN a collaborator test fixture includes project count fields
- WHEN the fixture is type-checked
- THEN TypeScript MUST accept it as a valid test user shape

#### Scenario: test globals compile

- GIVEN a project component test assigns `globalThis.route`
- WHEN the test file is type-checked
- THEN TypeScript MUST recognize the global helper and not report missing-property errors
