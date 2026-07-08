# Tasks: Public Profile Visibility UI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~160-220 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

One PR is realistic for Scope B.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Wire privacy fields through the show page and types | PR 1 | Base `resources/js/pages/users/show.tsx`; include `UserProfile` type sync. |
| 2 | Render privacy-aware contact and activity states | PR 1 | Update `user-profile-header.tsx` and `project-showcase.tsx` together so UI copy stays consistent. |

## Phase 1: Type and Prop Wiring

- [x] 1.1 Update `resources/js/types/index.ts` so `UserProfile` accepts optional `email`, `phone`, and `privacySetting` fields from `PrivacySetting`.
- [x] 1.2 Update `resources/js/pages/users/show.tsx` to derive `showActivity` from `user.privacySetting?.show_activity ?? true`.
- [x] 1.3 Pass the full `user` object through to `UserProfileHeader` and pass `showActivity` into `ProjectShowcase`.

## Phase 2: Privacy-Aware Rendering

- [x] 2.1 Update `resources/js/components/user/user-profile-header.tsx` to render email/phone when present and muted privacy text with a lock icon when absent.
- [x] 2.2 Update `resources/js/components/user/project-showcase.tsx` to accept `showActivity?: boolean` and switch the empty state copy/icon when activity is hidden.
- [x] 2.3 Keep the overall `ProjectShowcase` empty state privacy-aware so hidden activity never falls back to the generic no-projects message.

## Phase 3: Verification

- [x] 3.1 Add `resources/js/pages/users/show.test.tsx` using the shallow-mock pattern from `users/index.test.tsx` to verify prop wiring and rendered privacy states.
- [x] 3.2 Extend `resources/js/components/user/user-profile-header.test.tsx` or cover through the page test to assert email/phone shown vs hidden cases.
- [x] 3.3 Add cases for `ProjectShowcase` hidden activity versus genuinely empty activity.

## Phase 4: Cleanup

- [x] 4.1 Confirm `resources/js/pages/users/index.tsx` remains unchanged and remove any temporary test fixtures not needed for Scope B.
