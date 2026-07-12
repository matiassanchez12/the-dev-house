# Tasks: Backend CI Gates

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~35-50 |
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
|------|------|-----------|-------|
| 1 | Add the backend CI workflow only | PR 1 | Target the default branch; no child PRs needed. |
| 2 | Verify workflow behavior and baseline notes | PR 1 | Same PR; this scope is a single file slice. |

## Phase 1: Workflow Foundation

- [x] 1.1 Create `.github/workflows/backend.yml` with `on: pull_request` for the default branch and a single `backend` job.
- [x] 1.2 Pin `ubuntu-latest`, PHP 8.2, `composer`, and `sqlite3` with `shivammathur/setup-php@v2`; enable Composer caching.
- [x] 1.3 Add a YAML comment documenting the pre-existing 23 backend test failures as baseline debt and marking them out of scope.

## Phase 2: CI Execution Steps

- [x] 2.1 Add `actions/checkout@v4`, `composer install --no-interaction --prefer-dist --no-progress`, and copy `.env.example` to `.env`.
- [x] 2.2 Generate the app key with `php artisan key:generate` before the test command.
- [x] 2.3 Run `composer run test` as the blocking CI gate; do not add Node/npm build steps or `pint` in this change.

## Phase 3: Verification

- [x] 3.1 Validate the workflow YAML parses and the job references only PHP tooling (no `npm`, `vite`, or frontend build steps).
- [x] 3.2 Confirm the workflow trigger matches PRs targeting the default branch and the file path is exactly `.github/workflows/backend.yml`.
- [x] 3.3 Run local `composer run test` only to confirm CI mirrors the current baseline; do not fix the existing failing tests in this change.

## Phase 4: Cleanup

- [x] 4.1 Review the final YAML for minimalism and remove any redundant steps or comments before merge.
