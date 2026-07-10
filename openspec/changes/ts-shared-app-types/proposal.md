# Proposal: ts-shared-app-types

## Intent

Fix 7 TypeScript compile errors in the shared app-shell layer (layout, notifications, dropdown, field). These are foundation files consumed by many domain routes; fixing them removes shared-component type failures that cascade into domain-specific builds and prepares the ground for per-domain TS cleanup PRs.

## Scope

### In Scope
- `notification-bell.tsx` — import `NotificationItem`, fix local `PageProps` constraint, fix `setInterval` return type
- `dropdown.tsx` — replace invalid namespace type `DropdownMenuContent.Props` with `React.ComponentPropsWithoutRef`
- `field.tsx` — cast `children` to `ReactElement<any>` before `cloneElement`
- `app-layout.tsx` — type `usePage()` generic with `auth` shape

### Out of Scope
- Domain-specific TS errors (auth, profile, projects, onboarding, join requests, milestones, users)
- Backend or runtime behavior changes
- Extracting a shared `AppPageProps` abstraction (deferred to a broader TS-hygiene change)

## Capabilities

### New Capabilities
- None (pure typing fix, no behavior change)

### Modified Capabilities
- None (pure typing fix, no behavior change)

## Approach

Per-file targeted fixes (Approach A from exploration). Each fix addresses the exact TS error at its source without cross-file refactors:

1. `notification-bell.tsx` — add `import type { NotificationItem }`; make local `PageProps` extend Inertia `PageProps`; use `number` for interval ref
2. `dropdown.tsx` — switch prop type to `React.ComponentPropsWithoutRef<typeof DropdownMenuContent>`
3. `field.tsx` — use `ReactElement<any>` cast for `cloneElement` call
4. `app-layout.tsx` — pass `{ auth?: { user: User | null } }` generic to `usePage()`

No runtime changes. ~60 changed lines across 4 files.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/components/notification-bell.tsx` | Modified | Fixes 3 TS errors (hoisted import, PageProps constraint, setInterval type) |
| `resources/js/components/ui/dropdown.tsx` | Modified | Fixes 1 TS error (namespace → ComponentPropsWithoutRef) |
| `resources/js/components/ui/field.tsx` | Modified | Fixes 1 TS error (cloneElement overload via wider cast) |
| `resources/js/layouts/app-layout.tsx` | Modified | Fixes 1 TS error (usePage generic for auth) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `field.tsx` cast to `any` weakens type safety for `id` propagation | Low | Cast is isolated to `cloneElement` call site only; runtime behavior unchanged |
| `app-layout.tsx` generic drifts from backend prop shape | Low | Generic only adds `auth`; other props still flow through index signature |
| Future domain changes re-introduce similar `usePage` errors | Medium | Document `extends PageProps` requirement in conventions once all slices are clean |

## Rollback Plan

1. Revert the 4-file commit: `git revert <commit>`
2. Re-run `npx tsc --noEmit` to confirm the 7 errors return (expected)
3. Re-run `npm run build` to confirm Vite still bundles (no runtime breakage)

## Dependencies

- None (self-contained type-only change)

## Success Criteria

- [ ] `npx tsc --noEmit` reports zero errors in the 4 in-scope files
- [ ] `npm run build` succeeds with no new errors
- [ ] No runtime behavior changes (verified by existing build and manual smoke test)
- [ ] PR changed lines stay under the 400-line review budget (~60 lines expected)
