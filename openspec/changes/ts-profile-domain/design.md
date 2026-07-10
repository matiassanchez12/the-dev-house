# Design: Profile TypeScript Cleanup

## Technical Approach

Apply a narrow, profile-only TypeScript cleanup that removes compile-time errors without changing runtime behavior or introducing shared abstractions. The design follows the exploration recommendation: targeted fixes in the affected profile files, preserving existing Inertia + React form patterns.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|-------------------------|-----------|
| Page prop typing | Use local `usePage<T>()` generics at the consuming component boundary. | Shared profile page-props module; double casts through `unknown`. | Existing code already uses typed `usePage<T>()` in layouts/onboarding. Local generics fix the errors with the smallest blast radius. |
| Ref typing | Use `useRef<HTMLInputElement>(null)` for password inputs. | Non-null assertions; untyped refs; callback refs. | React refs start as `null`; the generic matches the `Input` ref contract and removes `unknown` cascades safely. |
| Event typing | Type form submit handlers as `React.FormEvent`. | Import `FormEvent`; rely on inferred inline handlers. | Existing files already reference `React.*` event types; this avoids extra imports and satisfies strict `noImplicitAny`. |
| Select null handling | Normalize nullable select values with `value ?? ''` before updating form state. | Widen `FormLink.platform` to `string | null`; ignore null with casts. | Form state already models empty platform as `''`; normalization preserves current filtering behavior. |
| Fixture boundaries | Complete local fixtures with required fields; do not relax domain types. | Make `created_at`/`updated_at` optional; cast fixtures. | Tests should satisfy production contracts. Type weakening would leak test convenience into domain types. |

## Data Flow

Profile page data remains unchanged. Types are tightened at the React boundary only.

```text
Laravel profile props ──Inertia──> Edit page
        │                         ├─ typed techs → UpdateProfileCompleteForm
        │                         ├─ typed auth.user from usePage<T>()
        │                         └─ form events/refs/select values normalized locally
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/pages/profile/edit.tsx` | Modify | Import `Tech`; type `userTechs` with the complete-form user-tech shape; read `techs` via typed `usePage<{ techs: Tech[] }>()`. |
| `resources/js/pages/profile/partials/delete-user-form.tsx` | Modify | Add `useRef<HTMLInputElement>(null)` and `React.FormEvent` for submit. Use optional focus if needed. |
| `resources/js/pages/profile/partials/update-password-form.tsx` | Modify | Add `HTMLInputElement` refs and submit event type. Use optional focus if needed. |
| `resources/js/pages/profile/partials/update-profile-information-form.tsx` | Modify | Type the submit event as `React.FormEvent`. |
| `resources/js/pages/profile/partials/update-profile-complete-form.tsx` | Modify | Import `User`; type `auth.user` with a local `ProfilePageProps` generic. Export or align the local `UserTech` type if needed by `edit.tsx`. |
| `resources/js/pages/profile/partials/social-links-edit-form.tsx` | Modify | Convert nullable select value to `''` before `updateLink`. |
| `resources/js/pages/profile/partials/update-profile-complete-form.test.tsx` | Modify | Add required timestamp fields to `Tech`/user-tech fixtures and user fixture if surfaced by the final page prop type. |

## Interfaces / Contracts

```ts
type ProfilePageProps = {
  auth: { user: User };
  techs?: Tech[];
};
```

Use only the fields required by each component. If `edit.tsx` needs the complete-form `UserTech` contract, expose that type from `update-profile-complete-form.tsx` or define a small page-local alias matching its `pivot` shape.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type check | Profile TypeScript errors are removed | Run `npx tsc --noEmit`; verify no errors remain in `resources/js/pages/profile/**`. |
| Unit | Existing complete profile form behavior | Run the existing Vitest test after fixture completion. |
| Build | Frontend integration | Run `npm run build` after type cleanup. |

## Migration / Rollout

No migration required. This is a compile-time-only cleanup with no backend or database changes.

## Open Questions

- [ ] Should the local complete-form `UserTech` type be exported from `update-profile-complete-form.tsx` or duplicated in `edit.tsx` to avoid coupling the page shell to the partial?
