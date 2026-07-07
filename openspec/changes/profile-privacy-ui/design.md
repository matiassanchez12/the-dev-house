# Design: Profile Privacy Settings UI — Scope A

## Technical Approach

Add one frontend-only privacy form to `/profile/edit` that consumes the existing `phone` and `privacySetting` Inertia props and submits them atomically to the existing `POST /profile/privacy` endpoint. The slice follows the current profile-page pattern: one card, one partial, one endpoint, isolated Vitest coverage.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|----------|--------|-------------------------|-----------|
| Insertion point | Render the new card in `resources/js/pages/profile/edit.tsx` after `UpdateProfileCompleteForm` and before `SocialLinksEditForm`. | Put phone in basic info or after social links. | Contact/privacy belongs near profile content, while keeping phone coupled to the endpoint that already owns it. |
| Component boundary | Create `resources/js/pages/profile/partials/update-privacy-form.tsx`. | Inline the form in `edit.tsx` or create a hook plus child components. | Existing profile forms are partials; a single component keeps the review surface small and avoids premature abstraction. |
| Toggle primitive | Use existing `Checkbox` from `@/components/ui/checkbox`. | Add a Switch component. | Proposal explicitly defers Switch; Checkbox is already available and compatible with boolean settings. |
| Form contract | Use `useForm<PrivacyFormData>()` and `post(route('profile.privacy.update'))`. | PATCH/PUT or separate phone/privacy forms. | Route is already `POST /profile/privacy`; backend updates phone and privacy settings in one transaction. |
| Type shape | Add `PrivacySetting` to `resources/js/types/index.ts` and use it in `Edit` props plus the new form. | Inline local types only. | Shared exported type prevents prop-shape drift and supports future privacy UI reuse. |

## Data Flow

```text
ProfileController::edit
  └─ Inertia props: phone, privacySetting
       └─ profile/edit.tsx
            └─ UpdatePrivacyForm
                 └─ useForm data
                      └─ POST route('profile.privacy.update')
                           └─ existing backend validation/service
```

The frontend initializes `phone` as `phone ?? ''`. On submit it sends `phone: data.phone.trim() === '' ? null : data.phone` plus all four booleans.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/pages/profile/edit.tsx` | Modify | Import `UpdatePrivacyForm` and `PrivacySetting`; accept `phone` and `privacySetting`; render a new card between complete profile and social links. |
| `resources/js/pages/profile/partials/update-privacy-form.tsx` | Create | Phone input, four Checkbox toggles, helper copy, submit button, success/error toast, and `Transition` saved state. |
| `resources/js/pages/profile/partials/update-privacy-form.test.tsx` | Create | Vitest/RTL coverage for initial values, toggle interaction, submit payload, and validation error rendering. |
| `resources/js/types/index.ts` | Modify | Export `PrivacySetting` with `id`, `user_id`, `show_email`, `show_phone`, `is_discoverable`, `show_activity`, timestamps. |

## Interfaces / Contracts

```ts
export interface PrivacySetting {
    id: number;
    user_id: number;
    show_email: boolean;
    show_phone: boolean;
    is_discoverable: boolean;
    show_activity: boolean;
    created_at: string;
    updated_at: string;
}

interface PrivacyFormData {
    phone: string;
    show_email: boolean;
    show_phone: boolean;
    is_discoverable: boolean;
    show_activity: boolean;
}
```

`UpdatePrivacyForm` props: `{ phone: string | null; privacySetting: PrivacySetting; className?: string }`.

## UX Details

Use a section title such as “Privacidad y contacto”. Place phone helper text directly under the `<Field>` input. Render each checkbox as a label row with the setting name and helper copy immediately below/next to it so the public-visibility consequence is visible before submission.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit/UI | Initial phone and privacy flags render from props. | Render `UpdatePrivacyForm` with representative props. |
| Unit/UI | Checkbox interaction updates `useForm` data. | Mock `useForm` following `update-profile-complete-form.test.tsx`; assert `setData` calls. |
| Unit/UI | Submit posts to privacy route with empty phone mapped to `null`. | Mock `post`, submit the form, assert route and payload transform behavior. |
| Unit/UI | Validation errors are accessible. | Assert `FormError` output for `phone` and flag errors. |

No Laravel/backend tests are required for Scope A because the endpoint, request, and service already exist.

## Migration / Rollout

No migration required. This is a frontend-only UI addition using existing persisted fields and route.

## Boundaries

- Defer Scope B: public profile rendering/enforcement of privacy-gated fields is not part of this design.
- Do not change Laravel routes, controllers, requests, services, models, migrations, or factories.
- Do not add a Switch UI primitive.
- Do not move phone into the basic profile form.

## Open Questions

None.
