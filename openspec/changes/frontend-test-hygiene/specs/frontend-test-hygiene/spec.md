# Frontend Test Hygiene Specification

## Purpose

Keep the frontend test suite and TypeScript typecheck green without changing product behavior.

## Requirements

### Requirement: Deterministic Project Chat Test Doubles

The system MUST allow `project-chat.test.tsx` to run with deterministic mocks for route lookup and realtime subscription callbacks.

#### Scenario: route and listen are available
- GIVEN the ProjectChat test renders with messages present
- WHEN the chat subscribes to realtime updates
- THEN `globalThis.route` is defined for the test run
- AND the registered `listen` callback can be invoked by the test

#### Scenario: missing realtime messages do not subscribe
- GIVEN the ProjectChat test renders without messages
- WHEN the component mounts
- THEN the test remains stable and does not depend on an undefined route helper

### Requirement: Fake-Timer Safe Notification Title Tests

The system MUST verify notification title pulse behavior in `notification-bell.test.tsx` without deadlocking under fake timers.

#### Scenario: title updates after render
- GIVEN a signed-in user with unread notifications
- WHEN NotificationBell renders under fake timers
- THEN the title assertion is made synchronously after render
- AND the pulsing interval is exercised only through explicit timer advancement

#### Scenario: title restores on unmount
- GIVEN NotificationBell has changed the document title
- WHEN the component unmounts
- THEN the original title is restored without waiting on polling helpers

### Requirement: TS 6 Typecheck Hygiene

The system MUST keep `npx tsc --noEmit` passing on TS 6 without the deprecated `baseUrl` setting in `tsconfig.json`.

#### Scenario: deprecated option is removed
- GIVEN the TypeScript config is loaded
- WHEN typecheck runs
- THEN no TS 6 `baseUrl` deprecation warning is emitted

#### Scenario: path aliases still resolve
- GIVEN existing frontend imports use configured aliases
- WHEN `npx tsc --noEmit` runs
- THEN alias resolution still succeeds and the typecheck completes cleanly
