# Proposal: Backend CI Gates

## Intent

There is **no backend CI today**. This change creates a minimal GitHub Actions workflow that runs the PHP test suite on every PR, protecting the 385 currently-passing tests from regressions. Twenty-three pre-existing failures are explicitly documented as baseline debt — this workflow does not attempt to fix them.

## Scope

### In Scope
- Create `.github/workflows/backend.yml` with a single PHP job
- PHP 8.2 setup + SQLite extension + composer install with caching
- `.env` generation and `php artisan key:generate`
- Run `composer run test` (blocking gate)
- Document the 23 pre-existing test failures as known baseline debt inside the workflow file

### Out of Scope
- Frontend CI or Node build steps
- Deployment automation
- Fixing the 23 pre-existing test failures
- `composer run pint` lint gating (deferred until a separate cleanup change)

## Capabilities

### New Capabilities
None — this is an infrastructure change; no application behavior is added or modified.

### Modified Capabilities
None — no existing spec requirements change.

## Approach

Create a pure-PHP GitHub Actions workflow (Approach A from exploration). The job needs **no Node toolchain** because `app.blade.php` wraps the `@vite` directive in `@unless (app()->runningUnitTests())`, so test requests never reference built frontend assets.

Steps:
1. `ubuntu-latest` runner
2. `shivammathur/setup-php@v2` — PHP 8.2, `sqlite3` extension, `composer`
3. `actions/checkout@v4`
4. `composer install` (with `setup-php` caching)
5. `cp .env.example .env` + `php artisan key:generate`
6. `composer run test`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/backend.yml` | New | Single-job backend CI pipeline (~35–50 lines) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pre-existing 23 test failures cause every PR to fail CI | High | Document baseline in workflow YAML comment; do not mark workflow as required in branch protection until debt is cleared |
| `composer install` slow or cache misses | Low | Use `setup-php` built-in caching; `composer.lock` exists |
| PHP version drift in CI vs local | Low | Pin `php-version: '8.2'` explicitly in `setup-php` |
| Missing SQLite extension | Low | Request `extensions: sqlite3` in `setup-php` because `phpunit.xml` forces `DB_CONNECTION=sqlite` |

## Rollback Plan

1. Delete `.github/workflows/backend.yml`
2. If the workflow was marked as required in branch protection, remove that requirement in repository settings
3. Revert is a single file deletion; zero database or application impact

## Dependencies

None — all tools (PHP, SQLite, composer, GitHub Actions) are standard and already used by the project.

## Success Criteria

- [ ] Workflow file is present in `.github/workflows/backend.yml`
- [ ] CI job runs automatically on every PR targeting the default branch
- [ ] Job completes (pass or fail) and reports test results in the PR checks panel
- [ ] Workflow file contains a comment documenting the 23 pre-existing failures as baseline debt
- [ ] No Node or frontend build steps are present in the backend workflow
