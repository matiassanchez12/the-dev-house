# Design: Public Profile Visibility UI

## Technical Approach

Render the existing `UserService::getPublicProfile()` privacy contract in the public profile frontend only. The backend already omits `email`, `phone`, and activity arrays based on `privacySetting`; this slice updates TypeScript types, header rendering, project empty states, page prop wiring, and frontend tests without changing backend behavior or settings UI.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Privacy source | Use `user.privacySetting?.show_activity` for project visibility and field presence for contact visibility | Recompute privacy from missing arrays/fields only | `show_activity` distinguishes intentionally hidden activity from genuinely empty projects; optional contact fields match backend omission semantics. |
| Header contact UI | Keep contact rendering inside `UserProfileHeader` because it already owns profile identity details | Add a separate contact component immediately | Scope is small; extraction can wait until the contact block grows. Existing header tests already cover this component. |
| Project empty state | Add optional `showActivity` prop to `ProjectShowcase` and switch empty-state copy/icon when false | Teach `ProjectShowcase` about the full `UserProfile` object | Passing a primitive keeps the component focused and testable. |
| Users index | Leave `resources/js/pages/users/index.tsx` unchanged | Add privacy indicators to user cards/list | The index uses `DiscoverableUser`, not `UserProfile`; discoverability filtering is backend-owned and this slice targets profile detail rendering only. |

## Data Flow

```text
UserService::getPublicProfile()
  └─ Inertia Users/Show page props
      ├─ Show passes full user to UserProfileHeader
      │   └─ Header renders email/phone or privacy indicators
      └─ Show passes project arrays + showActivity to ProjectShowcase
          └─ Showcase renders projects, normal empty state, or privacy empty state
```

`showActivity` should be derived in `show.tsx` as `user.privacySetting?.show_activity ?? true`, matching backend defaults when no privacy row exists.

## File Changes

| File | Action | Description |
|---|---|---|
| `resources/js/types/index.ts` | Modify | Add optional `email?: string`, `phone?: string | null`, and `privacySetting?: PrivacySetting | null` to `UserProfile`. |
| `resources/js/components/user/user-profile-header.tsx` | Modify | Add a compact contact row below social links; show email/phone when present, otherwise muted lock-state indicators. |
| `resources/js/components/user/project-showcase.tsx` | Modify | Add `showActivity?: boolean`; render privacy-aware empty states when false and no projects are visible. |
| `resources/js/pages/users/show.tsx` | Modify | Compute `showActivity`; always render `ProjectShowcase` inside the project section so it owns normal vs private empty states. |
| `resources/js/pages/users/show.test.tsx` | Create | Page-level tests for prop wiring and visible/hidden privacy states using existing shallow mocks. |
| `resources/js/pages/users/index.tsx` | Unchanged | Out of scope because list cards use discoverable summaries, not public profile details. |

## Interfaces / Contracts

```ts
interface UserProfile {
    email?: string;
    phone?: string | null;
    privacySetting?: PrivacySetting | null;
}

interface ProjectShowcaseProps {
    createdProjects: UserProject[];
    participatingProjects: UserProject[];
    showActivity?: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Component | Header contact display and private indicators | Extend `user-profile-header.test.tsx` or cover through page render when shallow mocks are not hiding the header. |
| Page | `users/show.tsx` passes contact fields and `showActivity` correctly | New `users/show.test.tsx` following `users/index.test.tsx` shallow-mock style for layout, cards, empty UI, icons, and child components where useful. |
| Integration/E2E | Not required for this frontend-only slice | Backend privacy behavior is already covered by privacy feature tests. |

Required cases: email shown, email hidden, phone shown, phone hidden, activity hidden empty state, and genuinely empty public activity state.

## Migration / Rollout

No migration required. Rollout is a frontend-only rendering change. Backend and settings UI work remain deferred.

## Boundaries

- Do not modify `UserService::getPublicProfile()`, privacy migrations, controllers, or profile settings forms.
- Do not change `DiscoverableUser`, `UserCard`, or `users/index.tsx`.
- Do not add stats-row privacy indicators; zero counts remain acceptable for this scope.

## Open Questions

- [ ] None.
