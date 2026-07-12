# Exploration: public-profile-visibility-ui (Scope B)

## Current State

The backend already implements the privacy contract (`UserService::getPublicProfile()`):
- `email` is added to the profile array only when `show_email=true`
- `phone` is added only when `show_phone=true` AND phone is non-null
- `createdProjects` and `participatingProjects` are forced to `[]` when `show_activity=false`
- `privacySetting` is always included in the profile array

However, the frontend `UserProfile` type (`resources/js/types/index.ts`) does **not** declare `email`, `phone`, or `privacySetting`, so the page currently ignores them.

`users/show.tsx` renders:
- `UserProfileHeader` — name, bio, avatar, social links, member date
- Stats row — created count, participating count, tech count
- `TechShowcase` or generic "Sin tecnologías" empty state
- `ProjectShowcase` or generic "Sin proyectos" empty state

The empty states for projects and techs do **not** distinguish between " genuinely empty" and "hidden by privacy". A visitor seeing "Sin proyectos" may incorrectly assume the user has never created a project, when in fact the user simply chose to hide activity.

`users/index.tsx` (directory) already receives only discoverable users because the backend (`UserService::getDiscoverableUsers()`) filters out `is_discoverable=false` users. No privacy-specific UI is currently present.

There is **no existing frontend test** for `users/show.tsx`.

## Affected Areas

| File | Why affected |
|------|-------------|
| `resources/js/types/index.ts` | `UserProfile` must include optional `email`, `phone`, and `privacySetting` to match the backend contract |
| `resources/js/pages/users/show.tsx` | Must conditionally render email/phone; must differentiate privacy-driven empty project states |
| `resources/js/components/user/project-showcase.tsx` | May need a `showActivity` prop so it can render a privacy-specific empty message instead of the generic one |
| `resources/js/components/user/user-profile-header.tsx` | Could display email/phone, or a separate contact section can be added in `show.tsx` |
| `resources/js/pages/users/show.test.tsx` | **New file** — tests for conditional rendering and privacy states |
| `resources/js/pages/users/index.tsx` | Assessed as **no changes required**; existing empty states are sufficient |

## Approaches

### Approach 1: Add contact info to `UserProfileHeader`
- Add `email` and `phone` display inside the existing header component, conditionally rendered
- Pros: keeps identity + contact info in one place; minimal page-level change
- Cons: slightly bloats the header; `UserProfileHeader` name implies identity, not contact
- Effort: Low

### Approach 2: Add a dedicated contact card below the header in `show.tsx`
- Render a small Card/CardContent block for email/phone directly in the page
- Pros: clear separation of concerns; header stays focused on identity
- Cons: slightly more page-level code
- Effort: Low

**Recommendation**: Approach 1 (inside `UserProfileHeader`) is simpler and keeps contact info near the user's name. If the header grows too large, we can refactor later.

### Privacy empty-state handling

#### Option A: Handle in `show.tsx` before passing to `ProjectShowcase`
- In `show.tsx`, check `user.privacySetting?.show_activity === false`
- If false AND arrays are empty, render a custom privacy empty block instead of `<ProjectShowcase>`
- Pros: no change to `ProjectShowcase` API; explicit at page level
- Cons: duplicates some empty-state logic already in `ProjectShowcase`
- Effort: Low

#### Option B: Pass `showActivity` prop to `ProjectShowcase`
- Add `showActivity?: boolean` to `ProjectShowcaseProps`
- Inside `ProjectShowcase`, when both arrays are empty and `showActivity === false`, show "Actividad oculta" message
- Pros: component-level responsibility; reusable if other pages use it
- Cons: changes component contract; currently only used in one place
- Effort: Low

**Recommendation**: Option B — it's cleaner and makes `ProjectShowcase` privacy-aware. The change is small (one optional prop + one conditional message).

### `users/index.tsx` changes
- **Decision**: No UI changes needed.
- Rationale: backend already excludes non-discoverable users. The existing empty states cover both "no users in system" and "filters returned nothing". Adding a privacy-specific message would be confusing and leak the existence of hidden users.

## Component / Test Patterns to Reuse

- **Empty component pattern**: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription` from `@/components/ui/empty` — already used in `show.tsx` and `project-showcase.tsx`
- **Test mocking pattern**: Existing `users/index.test.tsx` mocks Inertia `Link`/`router`, layout, UI primitives, and icons with vitest `vi.mock`. The new `show.test.tsx` should follow the same shallow-mock style for consistency.
- **Stat item pattern**: `StatItem` in `show.tsx` is a simple local component — can be replicated or extracted if needed.

## Files Likely to Change

1. `resources/js/types/index.ts` — extend `UserProfile`
2. `resources/js/pages/users/show.tsx` — conditional contact rendering + privacy empty state
3. `resources/js/components/user/project-showcase.tsx` — accept `showActivity` prop
4. `resources/js/components/user/user-profile-header.tsx` — display email/phone
5. `resources/js/pages/users/show.test.tsx` — new test file

## Risks

- **Type drift**: The `UserProfile` type has been out of sync with the backend contract. Fixing it may surface other mismatches.
- **Spanish UI copy consistency**: The project uses Spanish for user-facing strings. New messages must follow existing tone (neutral, professional).
- **Test coverage gap**: There is currently zero frontend test coverage for `users/show.tsx`. Adding it now is mandatory per project TDD rules.
- **Over-engineering `users/index.tsx`**: It is tempting to add a "some users are hidden" message, but that leaks privacy intent. Resist.

## Recommendation

Proceed with:
1. Update `UserProfile` type to match backend contract
2. Add `email`/`phone` to `UserProfileHeader` (or a contact section) with conditional rendering
3. Add `showActivity` prop to `ProjectShowcase` and render a privacy-specific empty message when activity is hidden
4. Leave `users/index.tsx` unchanged
5. Write `show.test.tsx` covering: email shown/hidden, phone shown/hidden, privacy empty state vs genuine empty state

## Ready for Proposal

Yes. The scope is narrow, the backend contract is already stable, and the frontend gaps are well-defined.
