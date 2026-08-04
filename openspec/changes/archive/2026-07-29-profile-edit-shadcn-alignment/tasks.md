# Tasks: Profile Edit — shadcn/ui Alignment (Scope 1)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~220-320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Historical note: this workload forecast was made for the original scope-1 slice only. The current candidate grew beyond that initial estimate because it also carries the documented `Input`, landing, and milestone collateral fixes.

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Align scope-1 profile sections and tests together | PR 1 | `npm test -- resources/js/pages/profile/partials/update-profile-information-form.test.tsx resources/js/pages/profile/partials/update-password-form.test.tsx resources/js/pages/profile/partials/delete-user-form.test.tsx resources/js/pages/profile/edit.test.tsx resources/js/pages/landing.test.tsx resources/js/components/landing/hero/landing-hero.test.tsx` | `npm run dev` → open `/profile/edit` and confirm the three scope-1 sections render as single cards with an accessible delete dialog | Revert the scope-1 files, `resources/js/components/ui/input.tsx`, the landing fixes, and the focused tests |

## Phase 1: RED Tests First

- [x] 1.1 Add `resources/js/pages/profile/partials/update-profile-information-form.test.tsx` to assert the form renders one `Card` shell and keeps its success/error behavior.
- [x] 1.2 Add `resources/js/pages/profile/partials/update-password-form.test.tsx` to assert one `Card` shell, gap-based layout, and password reset/focus behavior.
- [x] 1.3 Add `resources/js/pages/profile/partials/delete-user-form.test.tsx` to assert the dialog has a programmatic title and cancel still closes it.
- [x] 1.4 Add `resources/js/pages/profile/edit.test.tsx` to assert scope-1 partials are no longer wrapped in raw `bg-card` chrome.
- [x] 1.5 Tighten `resources/js/pages/profile/edit.test.tsx` so the page-level assertion uses semantic mocked regions instead of relying on `Card` internals.

## Phase 2: Core UI Refactor

- [x] 2.1 Refactor `resources/js/pages/profile/partials/update-profile-information-form.tsx` to use `CardHeader/CardContent/CardFooter` and `flex flex-col gap-*` spacing.
- [x] 2.2 Refactor `resources/js/pages/profile/partials/update-password-form.tsx` with the same Card/gap pattern, preserving `useForm` and toast flows.
- [x] 2.3 Refactor `resources/js/pages/profile/partials/delete-user-form.tsx` to use Card composition, remove `space-y-*`, and add `DialogTitle` inside `DialogContent`.
- [x] 2.4 Update `resources/js/pages/profile/edit.tsx` to remove the raw wrapper divs only around the three scope-1 partials.
- [x] 2.5 Update `resources/js/components/ui/input.tsx` to forward refs through the shared wrapper.
- [x] 2.6 Restore the landing stats/trust/wordmark content required by the existing landing tests.
- [x] 2.7 Preserve deterministic public milestone ordering in `PublicMilestoneController.php` and `MilestonesTest.php`.

## Phase 3: Verify Scope 1 Behavior

- [x] 3.1 Run the four Vitest files and fix any selector, mock, or accessibility mismatches.
- [x] 3.2 Run `npm run build` to catch JSX/import regressions from the Card composition swap.
- [x] 3.3 Run `php artisan test` to confirm the profile page refactor stays frontend-only.
- [x] 3.4 Run the focused landing Vitest files after restoring the hero/stats content.
- [x] 3.5 Run the focused Laravel milestone feature test for the null-ordering contract.

## Phase 4: Cleanup / Polish

- [x] 4.1 Tidy imports, spacing, and any test helpers introduced for the scope-1 refactor.
- [x] 4.2 Refresh OpenSpec artifact wording so the current candidate honestly lists the shared `Input`, landing, and milestone collateral fixes.
