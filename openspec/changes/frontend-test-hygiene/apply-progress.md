# Apply Progress: Frontend Test Hygiene

## Summary

- Restored deterministic chat test behavior by defining `globalThis.route` and capturing the realtime `listen` handler in the test double
- Removed fake-timer deadlocks from notification bell title tests
- Removed deprecated `baseUrl` from `tsconfig.json`

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| Project chat test doubles | Reproduced failing `project-chat.test.tsx` in full `npm test` and confirmed `route is not defined` plus missing realtime handler symptoms | Verified the focused chat test file passes after adding the `route` mock and capturing the `listen` callback | Kept the fix test-only by adjusting mocks rather than touching `project-chat.tsx` |
| Notification bell fake timers | Reproduced the two title-pulse timeout failures under fake timers | Verified `notification-bell.test.tsx` passes after switching to deterministic synchronous title assertions | Simplified the tests so they assert the current synchronous `useEffect` behavior directly |
| TypeScript config hygiene | Reproduced `TS5101` on `baseUrl` before the change | Verified `npx tsc --noEmit` no longer emits the `baseUrl` deprecation warning after removing it | Kept the config change minimal and confirmed remaining errors are unrelated global type issues |

## Files Changed

- `resources/js/components/projects/show/project-chat.test.tsx`
- `resources/js/components/notification-bell.test.tsx`
- `tsconfig.json`

## Verification Notes

- `npm test` passes
- `npx vitest run resources/js/components/projects/show/project-chat.test.tsx resources/js/components/notification-bell.test.tsx` passes
- `npx tsc --noEmit` still fails on unrelated repo-wide type issues, but the `baseUrl` deprecation warning is gone
