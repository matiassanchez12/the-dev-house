# Exploration: frontend-test-hygiene

## Current State

Three repo-global frontend hygiene blockers prevent a clean `npm test` and `npx tsc --noEmit` run. All three are isolated to test mocks or TypeScript config — no product behavior is broken.

| Blocker | Symptom | Location |
|---------|---------|----------|
| `route` undefined in chat test | `ReferenceError: route is not defined` when `Ctrl+Enter` fires submit | `project-chat.test.tsx` |
| Realtime handler never captured | `Ver nuevos mensajes` button never appears because `messageHandler` is never wired to the mock | `project-chat.test.tsx` |
| Fake timers deadlock title tests | `waitFor` hangs forever when `vi.useFakeTimers()` is active | `notification-bell.test.tsx` |
| TypeScript 6 `baseUrl` deprecation | `TS5101: Option 'baseUrl' is deprecated` | `tsconfig.json` |

---

## Affected Areas

- `resources/js/components/projects/show/project-chat.test.tsx` — missing `route` global mock; `listen` mock does not capture the callback into `messageHandler`
- `resources/js/components/notification-bell.test.tsx` — `waitFor` + `vi.useFakeTimers()` deadlock; `document.title` assertions should be synchronous
- `tsconfig.json` — line 25 `"baseUrl": "."` is deprecated under `moduleResolution: "bundler"` in TS 6

---

## Approaches

### 1. Fix `route` and `listen` mocks in chat test
**Description:** Provide a `globalThis.route` mock in `beforeEach`, and make the `listen` spy store the handler so `messageHandler` can invoke it.
- **Pros:** Restores the intended test coverage with minimal code. No product changes.
- **Cons:** None.
- **Effort:** Low

### 2. Resolve fake-timer deadlock in bell test
**Description:** Replace `await waitFor(() => expect(document.title).toBe(...))` with direct synchronous assertions, because the component updates `document.title` immediately inside `useEffect` during render.
- **Pros:** Eliminates timeout without increasing test complexity. No product changes.
- **Cons:** If future code defers title updates asynchronously, the test would need `waitFor` again.
- **Effort:** Low

**Alternative 2b:** Use `vi.useFakeTimers({ shouldAdvanceTime: true })` to let `waitFor` polling advance. Slightly more complex but preserves the async assertion style.

### 3. Remove `baseUrl` from tsconfig
**Description:** Delete the `"baseUrl": "."` line. Under `moduleResolution: "bundler"`, `paths` are already resolved relative to the tsconfig file, and all existing `paths` values use relative prefixes (`./resources/js/*`, etc.).
- **Pros:** Single-line config change. No product or import regressions.
- **Cons:** None.
- **Effort:** Low

---

## Recommendation

Adopt **Approach 1 + Approach 2 + Approach 3** together. They are independent, low-risk, and all test/config-only. The combined delta is ~20–30 lines across 3 files — well within the 400-line review budget.

| File | Change |
|------|--------|
| `project-chat.test.tsx` | Add `globalThis.route = vi.fn()` in `beforeEach`; change `mockState.listen` implementation to capture the callback into `messageHandler` |
| `notification-bell.test.tsx` | Remove `await waitFor` wrappers around `document.title` assertions; assert directly after `render` / `unmount` |
| `tsconfig.json` | Remove `"baseUrl": "."` |

---

## Risks

- **Import resolution regression after `baseUrl` removal:** Very low. All `@/*` and `@components/*` paths are relative to the tsconfig directory. Mitigation: run `npx tsc --noEmit` after removal.
- **Notification bell test flakiness if title logic becomes async later:** Low. The component currently updates title synchronously in `useEffect`. If that changes, the test would need revisiting.
- **Scope creep:** Existing tests for privacy features or backend are explicitly out of scope and must not be touched.

---

## Ready for Proposal

**Yes.** This change is narrow, well-understood, and requires no product code modifications. The next step is to write the SDD proposal and proceed to spec/design/tasks. A single PR is the correct delivery strategy.
