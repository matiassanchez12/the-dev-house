# Design: Backend CI Gates

## Technical Approach

Create one pure-PHP GitHub Actions workflow at `.github/workflows/backend.yml`. The workflow will run on pull requests and pushes, install PHP 8.2 with SQLite support, install Composer dependencies from `composer.lock`, generate a Laravel app key, then execute the existing backend test script: `composer run test`.

This follows the proposal's minimal backend-only slice. No application code, database schema, frontend assets, or OpenSpec config changes are required.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Workflow boundary | Create `.github/workflows/backend.yml` | Combine backend and frontend checks in one workflow | A backend-only workflow keeps the gate focused, reviewable, and independent from frontend CI concerns. |
| Runtime | Pin PHP `8.2` with `shivammathur/setup-php@v2` and `sqlite3` | Use latest PHP or project-local tooling | `composer.json` requires `php: ^8.2`; pinning avoids CI drift while matching Laravel 12 requirements. |
| Dependency install | Run `composer install --no-interaction --prefer-dist --optimize-autoloader` with Composer cache | Run `composer update` or full project setup script | CI must test locked dependencies. The `setup` script is intentionally avoided because it also runs Node install/build. |
| Test command | Run `composer run test` | Call `php artisan test` directly | The Composer script is the project's existing contract and already clears config before running tests. |
| Frontend assets | Omit `npm ci` and `npm run build` | Build assets “just in case” | `resources/views/app.blade.php` skips `@vite` during unit tests via `app()->runningUnitTests()`, so backend tests do not require `public/build`. |

## Data Flow

```text
GitHub event
  └─ backend workflow
      ├─ checkout repository
      ├─ setup PHP 8.2 + sqlite3 + Composer cache
      ├─ composer install
      ├─ copy .env.example to .env
      ├─ php artisan key:generate
      └─ composer run test
           └─ php artisan config:clear && php artisan test
                └─ phpunit.xml forces SQLite :memory:
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/backend.yml` | Create | Defines the backend CI workflow, triggers, PHP setup, Composer install, app key generation, and test command. |

## Interfaces / Contracts

The workflow contract is YAML-only:

```yaml
on:
  pull_request:
  push:
    branches: [development, master]
```

The job will expose a single required check named `backend-tests`. It depends on `phpunit.xml` for test environment configuration, including `DB_CONNECTION=sqlite` and `DB_DATABASE=:memory:`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Workflow syntax | GitHub Actions YAML is valid | Keep workflow minimal and use standard actions. |
| Backend integration | Laravel Feature and Unit tests execute in CI | Run `composer run test`. |
| Frontend | Not tested in this slice | Intentionally omitted; frontend CI owns Node install/build/type checks. |

## Migration / Rollout

No migration required. Roll out by merging the workflow file. Because the local baseline currently has 23 pre-existing test failures, do not mark this check as branch-protection-required until that debt is cleared or accepted as a failing baseline.

## Open Questions

- [ ] Should `backend-tests` initially be required in branch protection, or only observed until the 23 known failures are fixed?
