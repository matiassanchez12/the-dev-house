# Tasks: Frontend Test Hygiene

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~25-45 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Fix deterministic chat test doubles | PR 1 | Base on current branch; includes test verification for `project-chat.test.tsx`. |
| 2 | Remove fake-timer polling from bell tests | PR 1 | Same PR; verify title pulse and unmount behavior directly. |
| 3 | Clean TS config deprecation warning | PR 1 | Same PR; remove `baseUrl` only if typecheck stays green. |

## Phase 1: Project Chat Test Doubles

- [x] 1.1 Update `resources/js/components/projects/show/project-chat.test.tsx` to define `globalThis.route` in `beforeEach` and delete it in `afterEach`.
- [x] 1.2 Update `resources/js/components/projects/show/project-chat.test.tsx` mock state so `listen` captures the realtime handler and `messageHandler` can invoke it.
- [x] 1.3 Keep the existing chat assertions intact and verify the test still covers subscribe / send / new-message-button behavior.

## Phase 2: Notification Bell Fake-Timer Cleanup

- [x] 2.1 Update `resources/js/components/notification-bell.test.tsx` to remove `waitFor` around `document.title` checks under fake timers.
- [x] 2.2 Assert the title synchronously after render and after unmount, then advance timers only for the interval pulse checks.
- [x] 2.3 Preserve the broadcast subscription test and confirm the unread count still updates after notification callbacks.

## Phase 3: TypeScript Config Cleanup

- [x] 3.1 Remove the deprecated `baseUrl` entry from `tsconfig.json` and keep the existing `paths` aliases unchanged.
- [x] 3.2 Confirm no import-resolution changes are needed before moving on.

## Phase 4: Verification

- [x] 4.1 Run `npm test` and confirm the chat and notification-bell suites pass without timer deadlocks or undefined route errors.
- [x] 4.2 Run `npx tsc --noEmit` and confirm TS 6 no longer reports the `baseUrl` deprecation warning.
