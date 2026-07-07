# Proposal: Profile Privacy Settings UI

## Intent

The `/profile/edit` page currently ignores `phone` and `privacySetting` props injected by the backend. Users have no way to set their phone number or control privacy visibility (email, phone, directory discoverability, activity). This change adds a dedicated privacy section so users can manage contact and visibility preferences explicitly.

## Scope

### In Scope
- Phone input in `/profile/edit` (optional, nullable)
- Privacy toggles: `show_email`, `show_phone`, `is_discoverable`, `show_activity`
- Helper copy explaining what each toggle makes public
- Submit to existing `POST /profile/privacy`
- Tests for UI behavior, toggle interaction, and submission
- TypeScript `PrivacySetting` interface in `types/index.ts`

### Out of Scope
- Backend changes (endpoint, validation, service already exist)
- Switch component (use existing Checkbox; Switch is a future UI primitive)
- Public profile rendering of privacy-gated fields (Scope B)
- Phone input anywhere except profile edit

## Capabilities

### New Capabilities
- `profile-privacy-ui`: Phone input + 4 privacy toggles with helper copy, submitted atomically to `POST /profile/privacy`

### Modified Capabilities
- None (pure frontend wiring; backend contract unchanged)

## Approach

Create a single `UpdatePrivacyForm` partial following the existing one-card-one-endpoint pattern. Insert it between *Complete profile* and *Social links*. Use Inertia `useForm` with `post` to `route('profile.privacy.update')`. Map empty phone string to `null` on submit (backend already handles this in `UpdatePrivacyRequest::prepareForValidation()`). Use existing `<Checkbox>` for toggles since no `<Switch>` exists. Keep helper copy in Spanish to match existing profile UI.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/profile/edit.tsx` | Modified | Forward `phone` and `privacySetting` props |
| `resources/js/pages/profile/partials/update-privacy-form.tsx` | New | Phone + 4 toggles + submit |
| `resources/js/pages/profile/partials/update-privacy-form.test.tsx` | New | Wiring, toggle interaction, submission, errors |
| `resources/js/types/index.ts` | Modified | Add `PrivacySetting` interface |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Checkbox UX does not match user expectation for on/off | Med | Document as known; future slice can swap for Switch |
| `privacySetting` prop shape drifts from backend | Low | Add strict `PrivacySetting` type; align with `UserPrivacyService` |
| `useForm` mocking inconsistency in tests | Low | Follow `update-profile-complete-form.test.tsx` pattern |

## Rollback Plan

Revert the 4 changed/created files. The backend endpoint remains untouched, so no migration or data cleanup needed.

## Dependencies

- None. Backend route, validation, and service are already implemented.

## Success Criteria

- [ ] Phone field accepts empty string and submits without error
- [ ] All 4 toggles reflect current backend state on load
- [ ] Submit posts to `POST /profile/privacy` and shows success feedback
- [ ] Helper copy explains public visibility for each toggle
- [ ] Tests cover rendering, toggling, submission, and error display
- [ ] Review budget stays under 400 lines
