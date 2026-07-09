# Design: Frontend Test Hygiene

## Technical Approach

Apply three isolated test/config fixes that restore the intended frontend safety net without changing runtime behavior. `ProjectChat` and `NotificationBell` already implement the desired product behavior; the failures come from incomplete Vitest mocks and a fake-timer polling deadlock. TypeScript config cleanup removes the deprecated `baseUrl` option while keeping existing Vite/Vitest aliases as the runtime/test source of truth.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|--------------------------|-----------|
| Chat route mocking | Define `globalThis.route` in `project-chat.test.tsx` `beforeEach` and delete it in `afterEach`. | Add global Ziggy setup in `resources/js/test/setup.ts`. | The failure is local to submitting chat messages; a test-local mock avoids broad global test behavior changes. |
| Realtime handler capture | Implement `mockState.listen` so calls to `.listen('.message.created', handler)` store the handler in `messageHandler`. | Fire through a fake Echo implementation class. | The component only depends on the callback contract; capturing the function keeps the test focused and deterministic. |
| Bell fake timers | Replace `waitFor` around `document.title` checks with synchronous assertions after render/unmount, then advance fake timers only for interval ticks. | Use auto-advancing fake timers or keep async polling. | `NotificationBell` calls `renderTitle()` synchronously in `useEffect`; `waitFor` polls via timers and can deadlock under `vi.useFakeTimers()`. |
| TypeScript config cleanup | Remove `"baseUrl": "."` from `tsconfig.json`. | Keep it with `"ignoreDeprecations": "6.0"`. | With `moduleResolution: "bundler"`, `paths` entries resolve relative to `tsconfig.json`; Vite/Vitest aliases still cover runtime/test resolution. Suppression is only a fallback if typecheck proves unsafe. |

## Data Flow

```text
ProjectChat test render
  ├─ window.Echo.private('project.1')
  ├─ channel.listen('.message.created', handler) ──→ messageHandler
  └─ test invokes messageHandler(message) ──→ component state ──→ new-message button

NotificationBell test render
  ├─ useEffect runs renderTitle() synchronously
  ├─ document.title asserted directly
  └─ vi.advanceTimersByTime(1000) drives interval toggles
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/projects/show/project-chat.test.tsx` | Modify | Add local `route` mock; reset `messageHandler`; make `listen` capture the realtime callback. |
| `resources/js/components/notification-bell.test.tsx` | Modify | Remove `waitFor` from fake-timer title assertions; assert synchronous effect results directly. |
| `tsconfig.json` | Modify | Delete deprecated `baseUrl`; keep existing `paths`. |
| `resources/js/components/projects/show/project-chat.tsx` | No change | Product realtime/chat behavior remains untouched. |
| `resources/js/components/notification-bell.tsx` | No change | Product notification/title behavior remains untouched. |

## Interfaces / Contracts

No product interfaces change. Test doubles must satisfy these existing contracts:

```ts
globalThis.route = vi.fn().mockReturnValue('/projects/alpha/messages');
mockState.listen.mockImplementation((_event, handler) => {
  messageHandler = handler;
});
```

If `baseUrl` removal unexpectedly breaks TypeScript path resolution, the minimal fallback is adding `"ignoreDeprecations": "6.0"`; do not rework aliases unless `npx tsc --noEmit` proves it necessary.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Chat submit and realtime message behavior | Run targeted Vitest for `project-chat.test.tsx`. |
| Unit | Notification title pulse and cleanup | Run targeted Vitest for `notification-bell.test.tsx` with fake timers. |
| Typecheck | Alias/path safety after removing `baseUrl` | Run `npx tsc --noEmit`. |
| Regression | Full frontend test baseline | Run `npm test`. |

## Migration / Rollout

No migration required. This is test/config-only: no migrations, routes, controllers, services, React product components, or user-visible strings change.

## Open Questions

- [ ] None.
