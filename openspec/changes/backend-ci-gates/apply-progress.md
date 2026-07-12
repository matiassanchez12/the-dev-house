# Apply Progress: Backend CI Gates

## Summary

- Added the backend-only GitHub Actions workflow at `.github/workflows/backend.yml`
- Kept the job pure PHP: checkout, PHP 8.2 setup, Composer install, `.env` copy, app key generation, and `composer run test`
- Documented the 23 pre-existing backend test failures as baseline debt in the workflow comment

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| Workflow syntax | Confirmed there was no backend workflow before this change | Added `.github/workflows/backend.yml` and validated the YAML parses | Kept the workflow to one job and the smallest required step set |
| Backend bootstrap | Confirmed the backend CI slice needed PHP, Composer, `.env`, and app key setup | Added PHP 8.2, SQLite, Composer cache, `.env` copy, and `php artisan key:generate` | Avoided Node/tooling steps because backend tests do not need them |
| Test gate | Confirmed the gate should run the existing backend test script without changing it | Wired `composer run test` as the blocking CI step | Kept the baseline-debt note as a comment only; no failure suppression |

## Files Changed

- `.github/workflows/backend.yml` (new)
- `openspec/changes/backend-ci-gates/tasks.md`

## Verification Notes

- Workflow YAML syntax validated locally
- `composer run test` executed locally and finished with the existing baseline of 23 failing tests
- Several of the remaining failures are GD-dependent image tests in the current environment
