# Tasks: Profile Privacy Settings UI

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~220-320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

One PR realistic: Yes

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Privacy card + types wiring | PR 1 | Base on current branch; keep UI and tests together |

## Phase 1: Foundation

- [x] 1.1 Add `PrivacySetting` to `resources/js/types/index.ts` with the four boolean flags and timestamps.
- [x] 1.2 Update `resources/js/pages/profile/edit.tsx` props to accept `phone` and `privacySetting` and pass them to the new partial.

## Phase 2: Core UI

- [x] 2.1 Create `resources/js/pages/profile/partials/update-privacy-form.tsx` with `useForm`, `Field`/`Input`, four existing `Checkbox` controls, helper copy, and a submit button.
- [x] 2.2 Map blank `phone` to `null` on submit and post to `route('profile.privacy.update')` with `phone`, `show_email`, `show_phone`, `is_discoverable`, and `show_activity`.
- [x] 2.3 Insert the new privacy card in `resources/js/pages/profile/edit.tsx` between `UpdateProfileCompleteForm` and `SocialLinksEditForm`.

## Phase 3: Testing

- [x] 3.1 Add `resources/js/pages/profile/partials/update-privacy-form.test.tsx` using the existing Inertia mock pattern from `update-profile-complete-form.test.tsx`.
- [x] 3.2 Cover initial values, checkbox toggles, empty-phone submit payload, and inline error rendering for `phone` and one privacy field.
- [x] 3.3 Verify the page-level insert point by asserting the privacy card appears in the profile edit render flow.
