# Delta for Shared App Shell Types

## ADDED Requirements

### Requirement: Notification components use shared notification types

The notification bell and notification list components MUST compile against the shared notification item types exported by the notification list module. The bell MUST reference the shared item type through a type-only import and MUST NOT rely on an undeclared local type alias.

#### Scenario: Bell compiles with shared item type

- GIVEN the notification bell consumes notification items from the shared list module
- WHEN TypeScript compiles the app shell
- THEN no missing-type error is reported for notification item usage

#### Scenario: Local type shadowing does not occur

- GIVEN the shared notification item type is available from its module
- WHEN the bell defines its page props
- THEN the props type MUST resolve without forward-reference errors

### Requirement: App layout usePage access is typed

The authenticated app layout MUST type the `usePage()` call so `auth.user` is available as a typed property during compilation. The layout MUST NOT depend on untyped `unknown` access for auth state.

#### Scenario: Auth user compiles

- GIVEN the app layout reads the current authenticated user from page props
- WHEN TypeScript checks the layout
- THEN `auth.user` access compiles without property lookup errors

#### Scenario: Missing auth remains allowed

- GIVEN a page has no auth payload at runtime
- WHEN the layout type is evaluated
- THEN the generic page typing MUST still allow the layout to compile

### Requirement: Dropdown shared types match current Radix API

Shared dropdown wrapper types MUST be derived from the current Radix component props shape. The dropdown primitive MUST NOT reference a namespace-based `Props` type that is not exported by the Radix package.

#### Scenario: Wrapper compiles against Radix

- GIVEN the dropdown wrapper extends the Radix content component props
- WHEN TypeScript compiles the UI primitives
- THEN no namespace-type error is reported

#### Scenario: Radix prop surface stays inherited

- GIVEN a consumer passes valid Radix content props
- WHEN the shared dropdown component is used
- THEN those props MUST remain type-checked through the wrapper

### Requirement: Field child typing supports cloneElement

Shared field typing MUST allow `cloneElement` to inject field metadata into a valid child element without leaking broad `any` into the public component API. The cast MAY be local to the clone operation, but the exported field component type MUST remain specific enough for consumers.

#### Scenario: Valid child compiles

- GIVEN the field component receives a valid React element child
- WHEN TypeScript checks the clone operation
- THEN `cloneElement` compiles with injected `id` and aria attributes

#### Scenario: Non-element children are rejected

- GIVEN the field component receives a non-element child
- WHEN the component is type-checked
- THEN the child still fails validation through the existing element guard
