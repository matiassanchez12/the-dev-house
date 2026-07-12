# Tasks: ts-shared-app-types

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~60 |
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
|------|------|-----------|-------|
| 1 | Fix shared app-shell TypeScript errors in the 4 foundation files | PR 1 | Base on the current branch; keep verification in the same PR. |

## Phase 1: Shared Type Contracts

- [x] 1.1 `resources/js/components/notification-bell.tsx`: import `NotificationItem` as a type, make local `PageProps` extend Inertia `PageProps`, and keep the notification list props aligned with the shared module.
- [x] 1.2 `resources/js/layouts/app-layout.tsx`: type `usePage()` with the minimal `auth` shape so `auth.user` is compile-safe without changing runtime behavior.

## Phase 2: UI Primitive Typings

- [x] 2.1 `resources/js/components/ui/dropdown.tsx`: replace `DropdownMenuContent.Props` with `React.ComponentPropsWithoutRef<typeof DropdownMenuContent>`.
- [x] 2.2 `resources/js/components/ui/field.tsx`: narrow the validated child to `ReactElement<any>` only at the `cloneElement` call site.

## Phase 3: Verification

- [x] 3.1 Run `npx tsc --noEmit` and confirm the shared errors in `notification-bell.tsx`, `app-layout.tsx`, `dropdown.tsx`, and `field.tsx` are gone.
- [x] 3.2 Run `npm run build` to verify the fixes are type-only and do not alter runtime output.

## Phase 4: Cleanup

- [x] 4.1 Recheck import ordering and remove any temporary comments or debug code from the touched files.
