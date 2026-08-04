# Apply Progress: Profile Edit — shadcn/ui Alignment (Scope 1)

## Summary

- The main product-facing change remains the scope-1 profile refactor in `edit.tsx` plus the three aligned partials and their tests.
- The current candidate also carries three explicit collateral fixes: `Input` ref forwarding for focus management, landing hero/stats copy restoration, and deterministic public milestone ordering for backend verification.
- The latest re-review pass tightened `resources/js/pages/profile/edit.test.tsx` so it asserts page-level ownership with semantic mocked regions instead of depending on `Card` internals.
- OpenSpec artifacts were refreshed so reviewers can see the real candidate scope and changed files without reverse-engineering the worktree.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.5 | `resources/js/pages/profile/edit.test.tsx` | Component integration | Page wrapper ownership around scope-1 vs deferred sections | Prior native review flagged `data-slot` / parent-chain coupling | Updated semantic-region page test passed | Paired with the three partial tests so page ownership and section behavior are both covered | Simplified the page test by mocking partial boundaries instead of reaching into `Card` internals |

## Work Unit Evidence

| Evidence | Details |
|---|---|
| Focused test command and exact result | `npm test -- resources/js/pages/profile/partials/update-profile-information-form.test.tsx resources/js/pages/profile/partials/update-password-form.test.tsx resources/js/pages/profile/partials/delete-user-form.test.tsx resources/js/pages/profile/edit.test.tsx resources/js/pages/landing.test.tsx resources/js/components/landing/hero/landing-hero.test.tsx` → exit code 0; 6 files / 16 tests passed |
| Additional suite evidence | `npm test` → exit code 0; 35 files / 95 tests passed. `php artisan test --filter=MilestonesTest` → exit code 0; 1 test passed with existing PHPUnit doc-comment deprecation warnings. `npm run build` → exit code 0; Vite production build passed. |
| Runtime harness command/scenario and exact result | No dedicated browser harness was rerun in this pass; confidence comes from the focused profile, landing, and milestone tests plus the production build. |
| Rollback boundary | Revert the scope-1 profile TSX files, `resources/js/components/ui/input.tsx`, the three landing files, `app/Http/Controllers/PublicMilestoneController.php`, `tests/Feature/MilestonesTest.php`, `resources/js/pages/profile/edit.test.tsx`, and these updated OpenSpec notes if the follow-up review fix must be backed out. |

## Files Changed

- `openspec/changes/profile-edit-shadcn-alignment/tasks.md`
- `openspec/changes/profile-edit-shadcn-alignment/apply-progress.md`
- `openspec/changes/profile-edit-shadcn-alignment/exploration.md`
- `openspec/changes/profile-edit-shadcn-alignment/proposal.md`
- `openspec/changes/profile-edit-shadcn-alignment/design.md`
- `app/Http/Controllers/PublicMilestoneController.php`
- `tests/Feature/MilestonesTest.php`
- `resources/js/components/ui/input.tsx`
- `resources/js/pages/landing.tsx`
- `resources/js/components/landing/hero/hero-headline.tsx`
- `resources/js/components/landing/hero/hero-wordmark.tsx`
- `resources/js/pages/profile/partials/delete-user-form.tsx`
- `resources/js/pages/profile/partials/delete-user-form.test.tsx`
- `resources/js/pages/profile/partials/update-profile-information-form.tsx`
- `resources/js/pages/profile/partials/update-profile-information-form.test.tsx`
- `resources/js/pages/profile/partials/update-password-form.tsx`
- `resources/js/pages/profile/partials/update-password-form.test.tsx`
- `resources/js/pages/profile/edit.tsx`
- `resources/js/pages/profile/edit.test.tsx`

## Verification Notes

- The shared `Input` wrapper now forwards refs, which keeps scope-1 focus-on-error behavior aligned with the actual DOM input element.
- The landing collateral fixes restore the stats section, live trust badge, and visible wordmark/strapline already expected by the landing tests.
- The collateral milestone fix keeps pending milestones after completed ones, orders completed milestones by `completed_at` descending, and uses `id` descending as the tie-breaker.
- The page-level profile test now checks wrapper ownership via semantic mocked regions, reducing coupling to `Card` DOM details.
- The previously failing full Vitest suite now passes after the landing restoration changes.
