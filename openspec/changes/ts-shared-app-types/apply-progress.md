# Apply Progress: TS Shared App Types

## Summary

- Fixed all 7 TypeScript errors in the shared app-shell layer
- Added type-only `NotificationItem` import
- Made `notification-bell.tsx` `PageProps` extend Inertia `PageProps`
- Used `number` directly for the browser interval ref
- Switched `app-layout.tsx` to a typed `usePage<{ auth?: { user: User | null } }>()`
- Replaced `DropdownMenuContent.Props` namespace with `ComponentPropsWithoutRef<typeof DropdownMenuContent>`
- Changed the default `Dropdown.Content` align to `end` to match the current Radix type
- Narrowed `field.tsx` `cloneElement` cast to `ReactElement<Record<string, unknown>>` with the same `Record<string, unknown>` shape for the injected props

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| NotificationBell | Captured baseline `npx tsc --noEmit` showing 3 errors in `notification-bell.tsx` (TS2552, TS2344, TS2322) | Verified the three errors disappear after the type-only import + `extends InertiaPageProps` + `number` ref changes | Kept the type-only import and removed the awkward `export type { NotificationItem }` re-export |
| AppLayout | Captured baseline `usePage().props.auth` failing with `Property 'user' does not exist on type '{}'` | Verified the error disappears after typing `usePage<{ auth?: { user: User | null } }>()` | Dropped the previous `as User | null | undefined` cast in the same change |
| Dropdown | Captured baseline `Cannot find namespace 'DropdownMenuContent'` | Verified the namespace error disappears after switching to `ComponentPropsWithoutRef<typeof DropdownMenuContent>` and aligning default to `end` | Default change is consistent with how the two callers already use `<Dropdown.Content align="end">` |
| Field | Captured baseline `cloneElement` overload rejection | Verified the overload error disappears after casting the validated child to `ReactElement<Record<string, unknown>>` and the props to the same shape | Kept the cast local to the `cloneElement` site so the public `FieldProps` API stays clean |

## Files Changed

- `resources/js/components/notification-bell.tsx`
- `resources/js/components/ui/dropdown.tsx`
- `resources/js/components/ui/field.tsx`
- `resources/js/layouts/app-layout.tsx`

## Verification Notes

- `npx tsc --noEmit` no longer reports the 7 shared errors; only unrelated domain-specific TS debt remains
- `npm run build` passes
- `notification-bell.test.tsx` keeps working because it mocks `Dropdown.Content` and does not depend on the default align value
</content>
