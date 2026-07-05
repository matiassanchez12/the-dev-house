# Tasks: Form Accessibility Shadcn Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~180-260 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Onboarding slice accessibility pass | PR 1 | `resources/js/pages/onboarding/index.tsx`; keep flow and validation unchanged |
| 2 | Profile-complete accessibility pass | PR 1 | `resources/js/pages/profile/partials/update-profile-complete-form.tsx`; keep composite controls accessible |
| 3 | Verification | PR 1 | Update assertions for labels, errors, and composite controls |

## Phase 1: Onboarding slice

- [x] 1.1 Update onboarding fields to use the existing shadcn/ui form foundation and accessible labels.
- [x] 1.2 Ensure invalid onboarding fields expose stable error associations and screen-reader announcements.
- [x] 1.3 Verify the onboarding step sequence, endpoints, and validation contract remain unchanged.

## Phase 2: Profile-complete slice

- [x] 2.1 Update profile-complete fields to use shadcn/ui primitives with programmatic labels.
- [x] 2.2 Keep profile-complete composite controls accessible with accordion and slider semantics.
- [x] 2.3 Ensure invalid fields expose `aria-invalid` and stable error wiring.

## Phase 3: Verification

- [x] 3.1 Update or add component tests for labels, invalid state, and error announcements.
- [x] 3.2 Re-run existing feature coverage for onboarding/profile-complete flows.
- [x] 3.3 Confirm no backend validation rules or routes changed.
