# Exploration: backend-ci-gates

## Executive Summary

There is **no backend CI at all** today. The repo has zero `.github/workflows` files.

The backend test suite runs against an in-memory SQLite database, requires no external services, and **does not need compiled frontend assets** because `app.blade.php` skips the `@vite` directive during unit tests (`@unless (app()->runningUnitTests())`).

The smallest safe backend CI is a single GitHub Actions workflow that installs PHP 8.2, runs `composer install`, copies `.env.example`, generates an app key, and runs `composer run test`. Optionally add `composer run pint` as a hard lint gate.

**Important baseline**: `php artisan test` currently reports **23 failed, 385 passed** on the local checkout. These failures are pre-existing and explicitly **out of scope** for this change.

---

## Current State

| Check | Command / Location | Result | Notes |
|---|---|---|---|
| CI files exist | `.github/workflows/*` | ❌ None found | No automated checks run on PRs |
| PHP version | `composer.json` `require.php` | `^8.2` | Laravel 12 requirement |
| Test database | `phpunit.xml` | ✅ SQLite `:memory:` | No external DB service needed in CI |
| Test runner | `composer run test` | Runs `php artisan test` | Defined in `composer.json` scripts |
| Lint tool | `laravel/pint` (dev dependency) | Available | Can be wired as a hard or soft gate |
| Frontend assets needed for tests? | `resources/views/app.blade.php` | ❌ No | `@vite` is wrapped in `@unless (app()->runningUnitTests())` |
| Existing test baseline | `php artisan test` (local) | 23 failed, 385 passed | Pre-existing failures; out of scope |

### Why `npm ci` + `npm run build` is NOT required

`app.blade.php` line 68–70:

```blade
@unless (app()->runningUnitTests())
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
@endunless
```

During PHPUnit runs, `app()->runningUnitTests()` returns `true`, so the `@vite` directive is never rendered. The Laravel test requests therefore never reference `vite` assets, and the CI job does not need a `public/build` directory or any Node toolchain.

This is a critical simplification: the backend CI job can be pure PHP.

---

## Affected Areas

- `.github/workflows/backend.yml` — **create** (new CI pipeline)
- `openspec/config.yaml` — **possibly modify** (add backend CI metadata if gaps exist)

---

## Approaches

### Approach A — Pure PHP Job (Recommended)

Create a single workflow with one job:

1. `ubuntu-latest` runner
2. `shivammathur/setup-php@v2` with PHP 8.2 + `sqlite` extension + `composer`
3. `actions/checkout@v4`
4. `composer install` (with `actions/cache` or `setup-php` caching)
5. `cp .env.example .env` + `php artisan key:generate`
6. `composer run test`

Optional second job (same file, non-blocking or blocking):
- `composer run pint` — lint check. Can be blocking if the codebase is already clean, or soft-gated if not.

- **Pros**: Minimal, fastest, no Node overhead, matches the actual test requirements.
- **Cons**: Does not verify frontend build integrity (but that is the frontend CI's job).
- **Effort**: Low (~35–50 lines of YAML).

### Approach B — PHP + Lint Hard Gate

Same as A, but `composer run pint` is a required, blocking job in the same workflow.

- **Pros**: Enforces code style on every PR.
- **Cons**: If `pint` finds existing style violations, all PRs would fail until a one-time cleanup is done.
- **Effort**: Low if codebase is already clean; Medium if a cleanup PR is needed first.

### Approach C — Combined Job with Frontend Steps

Add `npm ci` + `npm run build` before `php artisan test` "just in case."

- **Pros**: Covers the theoretical case where a test touches a view that references built assets.
- **Cons**: Adds ~30–60 seconds of unnecessary Node setup and build time on every backend PR. The `@unless` guard makes this objectively unnecessary.
- **Effort**: Low, but wasteful.

---

## Recommendation

**Adopt Approach A** with `composer run pint` as a **blocking** second job **only if** a quick local `composer run pint` shows zero existing violations. If `pint` would flag existing issues, make it a separate, non-blocking job (or defer it to a follow-up change).

Create `.github/workflows/backend.yml` with:

- `setup-php` (8.2) + `sqlite` extension
- `composer install` with caching
- `.env` generation + key generation
- `composer run test` as the required, blocking job
- A comment documenting the pre-existing 23 test failures and stating that this CI change does **not** attempt to fix them

This is the smallest coherent backend CI slice: it protects against regressions in the 385 passing tests and enforces the backend gate without scope creep into test repair or frontend build orchestration.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Pre-existing 23 test failures cause every PR to fail CI | High (if not addressed) | Document the baseline in the workflow YAML comment; create a separate `fix-backend-tests` change to clear the debt, or mark the workflow as not yet required in branch protection until tests are green |
| `composer install` duration or cache misses | Low | Use `actions/cache` or `setup-php` built-in caching; lockfile exists |
| CI PHP version drift (local 8.4 vs required 8.2) | Low | Pin `php-version: '8.2'` in `setup-php` explicitly |
| Missing `sqlite` PHP extension | Low | Request `extensions: sqlite3` or `pdo_sqlite` in `setup-php` because `phpunit.xml` forces `DB_CONNECTION=sqlite` |

---

## Ready for Proposal

**Yes.**

The orchestrator should proceed to `sdd-propose` with the scope locked to:

1. Create `.github/workflows/backend.yml`
2. Optionally update `openspec/config.yaml` to document the backend CI runner and testing baseline

Everything else (fixing the 23 pre-existing test failures, wiring `pint` as a hard gate if it finds violations) is explicitly out of scope and should be tracked as separate changes.

---

## Likely Files to Change

1. `.github/workflows/backend.yml` — **create** (~35–50 lines)
2. `openspec/config.yaml` — **modify** (add/update `quality.backend_ci` or test-baseline notes if the config schema supports it)
