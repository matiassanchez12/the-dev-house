# Design: ts-shared-app-types

## Technical Approach

Apply narrow, file-local TypeScript fixes in the shared app shell. The change removes compile errors in layout, notifications, dropdown, and field primitives without changing runtime behavior, backend contracts, or domain-specific slices.

This maps directly to the shared-app-shell-types spec: reuse the existing notification item export, type `usePage()` at the call site, derive Radix wrapper props from the component value, and isolate the `cloneElement` cast to the injection boundary.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|--------------------------|-----------|
| Notification item shape | Import `NotificationItem` as a type from `@/components/notification-list` in `notification-bell.tsx`. | Duplicate the interface locally; move the type to `resources/js/types/index.ts`. | The list already owns the exact shape consumed by notifications. A type-only import avoids runtime coupling and avoids a wider shared-types refactor that is explicitly out of scope. |
| `usePage()` typing | Use local generics for each app-shell caller: `notification-bell.tsx` includes `auth`, `notifications`, and `url`; `app-layout.tsx` includes only optional `auth.user`. | Add a global `AppPageProps`; keep casts from `unknown`. | Local generics fix the failing access points while preserving the deferred decision to design a full app-wide Inertia props contract later. Optional `auth` keeps pages without auth payloads type-compatible. |
| Dropdown content props | Replace `DropdownMenuContent.Props` with `React.ComponentPropsWithoutRef<typeof DropdownMenuContent>`. | Hand-write wrapper props; use `ComponentProps`. | Radix exposes props through the component type, not a namespace `Props` export. `ComponentPropsWithoutRef` keeps the public wrapper aligned with Radix while avoiding unsupported ref expectations. |
| Field clone cast | Cast only the validated child at the `cloneElement` call to `ReactElement<any>`. | Make `children` public API `ReactElement<any>`; suppress the error; build a custom prop interface. | The existing runtime guard remains the boundary for non-elements. The `any` is intentionally local because React’s clone overload cannot prove injected `id` and ARIA props are valid for every possible child. |

## Data Flow

No runtime data flow changes.

```text
Inertia page props ──→ usePage<T>() ──→ layout / notification rendering
Radix component type ──→ dropdown wrapper prop type ──→ consumers
Field child ──→ isValidElement guard ──→ cloneElement metadata injection
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/notification-bell.tsx` | Modify | Add type-only `NotificationItem` import, make local page props compatible with Inertia `PageProps`, and keep the browser interval ref typed from `window.setInterval`. |
| `resources/js/layouts/app-layout.tsx` | Modify | Replace the `auth.user` cast with a `usePage<{ auth?: { user: User | null } }>()`-style generic access. |
| `resources/js/components/ui/dropdown.tsx` | Modify | Derive content wrapper props from `DropdownMenuContent` with `React.ComponentPropsWithoutRef`. |
| `resources/js/components/ui/field.tsx` | Modify | Keep the exported props unchanged and narrow the clone fix to the `ReactElement<any>` cast at the clone boundary. |

## Interfaces / Contracts

No new exported domain contract is introduced. The only local compile-time contracts are:

```ts
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import type { NotificationItem } from '@/components/notification-list';

interface NotificationBellPageProps extends InertiaPageProps {
  auth?: { user: User | null };
  notifications?: NotificationItem[] | { data: NotificationItem[] };
}
```

`NotificationItem` remains owned by `notification-list.tsx`. `User` continues to come from `@/types` where the layout already imports it.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type check | The four in-scope shared app-shell files compile. | Run `npx tsc --noEmit`; evaluate only this cleanup’s files if unrelated domain errors remain. |
| Build | Vite still bundles the app. | Run `npm run build`. |
| Runtime smoke | Layout, notification dropdown, dropdown links, and field error attributes still render. | Manual browser smoke test if build succeeds. |

## Migration / Rollout

No migration required. This is compile-time only: it changes TypeScript annotations/imports and one local cast, not emitted runtime behavior, backend payloads, routes, database schema, or domain slices.

## Open Questions

- [ ] None.
