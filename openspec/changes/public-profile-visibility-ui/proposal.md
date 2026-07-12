# Proposal: Public Profile Visibility UI (Scope B)

## Intent
Render the backend privacy contract on public profiles so visitors understand when information is intentionally hidden rather than missing. The backend already filters data (`UserService::getPublicProfile`); the frontend currently ignores privacy flags and shows misleading generic empty states.

## Scope

### In Scope
- Update `UserProfile` type to include optional `email`, `phone`, and `privacySetting`
- Conditionally render email/phone in `UserProfileHeader` with a privacy indicator when hidden
- Add `showActivity` prop to `ProjectShowcase` for privacy-aware empty states
- Write `users/show.test.tsx` covering contact visibility and privacy empty states

### Out of Scope
- Backend changes, settings UI, or `users/index.tsx` modifications
- Stats row privacy indicators (arrays are already empty; 0 is acceptable)

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Approach
1. **Type sync**: Extend `UserProfile` with optional `email`, `phone`, and `privacySetting: PrivacySetting`.
2. **Contact rendering**: In `UserProfileHeader`, add a contact row below social links. Show email/phone with icons when present. When absent, render muted "Email privado" / "Teléfono privado" text with a lock icon so visitors know the omission is intentional.
3. **Privacy empty states**: Pass `showActivity` to `ProjectShowcase`. When both project arrays are empty and `showActivity === false`, render "Actividad oculta" with a lock icon instead of the generic "No hay proyectos" message. Tab-level empty states inside `ProjectShowcase` use the same logic.
4. **Tests**: Create `show.test.tsx` using the existing shallow-mock pattern from `users/index.test.tsx`. Cover: email shown/hidden, phone shown/hidden, activity hidden vs genuinely empty.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/types/index.ts` | Modified | Add `email?`, `phone?`, `privacySetting?` to `UserProfile` |
| `resources/js/components/user/user-profile-header.tsx` | Modified | Add conditional email/phone display + privacy indicators |
| `resources/js/components/user/project-showcase.tsx` | Modified | Add `showActivity?` prop; privacy-specific empty state |
| `resources/js/pages/users/show.tsx` | Modified | Pass `privacySetting` to `ProjectShowcase`; pass `user` contact fields to header |
| `resources/js/pages/users/show.test.tsx` | New | Frontend tests for conditional rendering and privacy states |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Type drift with backend contract | Low | Match `UserService::getPublicProfile()` exactly; optional fields only |
| Spanish copy inconsistency | Low | Follow existing neutral/professional tone; use "privado" not "oculto" for contacts |
| Over-engineering stats or index | Med | Explicitly exclude stats and `users/index.tsx` from scope |

## Rollback Plan
Revert the five files listed in Affected Areas. No database or backend changes required.

## Dependencies
- Backend `UserService::getPublicProfile()` contract (already stable)

## Success Criteria
- [ ] Email and phone render when backend sends them; privacy indicator renders when they are absent
- [ ] Project showcase shows "Actividad oculta" when `show_activity=false` and arrays are empty
- [ ] `users/show.test.tsx` passes with coverage for shown, hidden, and empty states
- [ ] `users/index.tsx` remains unchanged
- [ ] PR stays under 400 changed lines
