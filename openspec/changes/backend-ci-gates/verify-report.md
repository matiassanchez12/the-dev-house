# Verification Report: Backend CI Gates

**Change**: `backend-ci-gates`  
**Mode**: openspec, Strict TDD active  
**Scope**: backend CI workflow only

## Evidence

| Check | Command | Outcome |
|---|---|---|
| YAML parse | `python3 - <<'PY' ... yaml.load(..., Loader=yaml.BaseLoader) ...` | ✅ Parsed successfully; top-level keys: `name`, `on`, `jobs` |
| Workflow shape | `python3 - <<'PY' ... workflow assertions ...` | ✅ PR trigger to `master`; job `backend-tests`; PHP 8.2; `sqlite3`; Composer cache; install; `.env`; key generation; `composer run test`; no Node/npm/Vite/Pint/`continue-on-error` |
| Default branch | `git symbolic-ref refs/remotes/origin/HEAD || true` | ✅ `refs/remotes/origin/master` |
| GitHub Actions semantic lint | `actionlint .github/workflows/backend.yml` if available | ➖ Skipped: `actionlint not installed` |
| Backend test baseline | `composer run test` | ❌ Exit code 2 via Composer script; `23 failed, 385 passed (1493 assertions)` |

## Compliance Matrix

| Requirement / Scenario | Result | Evidence |
|---|---|---|
| PR to default branch triggers CI | ✅ COMPLIANT | `.github/workflows/backend.yml` uses `on.pull_request.branches: [master]`; `origin/HEAD` is `master` |
| Non-target branches do not trigger this workflow | ✅ COMPLIANT | Branch filter only includes `master` |
| Environment is bootstrapped for Laravel tests | ✅ COMPLIANT | Workflow sets PHP `8.2`, `sqlite3`, Composer cache/install, `.env` copy, and `php artisan key:generate` |
| Backend CI does not require Node tooling | ✅ COMPLIANT | No Node/npm/Vite/frontend build step present |
| Test suite executes in CI | ✅ COMPLIANT | Workflow runs exactly `composer run test`; local execution confirms the command runs the suite |
| Test failures remain visible | ✅ COMPLIANT | No `continue-on-error`; local command exits non-zero with failures |
| Reviewers can see known baseline debt | ✅ COMPLIANT | YAML comment states: `23 test failures pre-exist this workflow and remain out of scope` |
| Baseline debt does not mask red CI | ✅ COMPLIANT | Test step is blocking; current baseline remains red |

## Scope-local vs Baseline

- **Scope-local**: ✅ Workflow file is valid YAML and matches the backend-only gate shape requested by proposal/spec/tasks.
- **Baseline**: ❌ `composer run test` is currently red with 23 existing failures. This verification does not treat those as fixed or scope-local regressions.

## Design Notes

- The workflow follows the proposal/spec requirement to run on PRs targeting the default branch.
- Minor design variance: `design.md` mentions `push` triggers, but the proposal/spec/tasks scope is PR-default-branch CI. This is non-blocking for this scoped verification.

## TDD Compliance

- Apply progress includes a TDD evidence table, but this infrastructure slice has no separate production test files to audit.
- Runtime evidence was supplied through YAML parsing/static workflow assertions and `composer run test` baseline execution.

## Issues

**CRITICAL**: None for the backend CI workflow scope.  
**WARNING**: Existing backend baseline remains red: `23 failed, 385 passed`; do not mark this check as branch-protection-required until that debt is handled or intentionally accepted.  
**SUGGESTION**: Install/use `actionlint` in future CI workflow changes for GitHub Actions semantic linting.

## Verdict

**PASS WITH WARNINGS** — the backend CI workflow is scope-compliant and correctly exposes the current failing backend baseline instead of hiding it.
