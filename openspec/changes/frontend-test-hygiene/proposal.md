# Proposal: frontend-test-hygiene

## Intent
Restore a clean `npm test` and `npx tsc --noEmit` baseline by fixing three isolated frontend test/config blockers. No product behavior changes.

## Scope

### In Scope
- Fix `project-chat.test.tsx` mocks (`route` undefined, `listen` handler not captured)
- Fix `notification-bell.test.tsx` fake-timer deadlock with `waitFor`
- Remove TS 6 deprecated `baseUrl` from `tsconfig.json`

### Out of Scope
- Privacy feature tests
- Backend changes
- Any unrelated failing suites

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

## Approach
Apply three independent, test-only/config-only fixes recommended by exploration:

| File | Fix |
|------|-----|
| `project-chat.test.tsx` | Mock `globalThis.route` in `beforeEach`; make `mockState.listen` store callback so `messageHandler` can invoke it |
| `notification-bell.test.tsx` | Replace `await waitFor(() => expect(document.title).toBe(...))` with direct synchronous assertions after render/unmount |
| `tsconfig.json` | Remove `"baseUrl": "."` line |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/projects/show/project-chat.test.tsx` | Modified | Deterministic route/listen mocks |
| `resources/js/components/notification-bell.test.tsx` | Modified | Remove fake-timer deadlock |
| `tsconfig.json` | Modified | Remove deprecated `baseUrl` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Import resolution regression after `baseUrl` removal | Very Low | Run `npx tsc --noEmit` after removal; all paths are already relative |
| Bell test breaks if title logic becomes async later | Low | Component currently updates title synchronously in `useEffect` |

## Rollback Plan
Revert the three file changes with a single git revert. No DB migrations, env vars, or infra changes.

## Dependencies
None

## Success Criteria
- [ ] `npm test` passes without the three targeted failures
- [ ] `npx tsc --noEmit` emits no `TS5101` deprecation warning
- [ ] No product source files modified
