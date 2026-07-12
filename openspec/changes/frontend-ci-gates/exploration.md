# Exploration: frontend-ci-gates

## Executive Summary

There is **no frontend CI at all** today. The repo has zero `.github/workflows` files.

The good news: `npm test` (54 tests) and `npm run build` (Vite 7 production) are both green.

The blocker: `npx tsc --noEmit` emits ~124 lines of type errors across domain code (notifications, auth pages, PageProps, project status manager, etc.). This debt is explicitly **out of scope** of the current branch work (`ts-platform-foundation` fixed only platform-level config errors).

The right move for this branch is to **create a GitHub Actions workflow that hard-gates on tests and build, and soft-gates on typecheck** (informational only), with a documented path to flip the typecheck gate once domain debt is cleared.

---

## Current State

| Check | Command | Result | Notes |
|---|---|---|---|
| CI files exist | `.github/workflows/*` | ❌ None found | No automated frontend checks run on PRs |
| Tests | `npm test` | ✅ Pass | 19 files, 54 tests (Vitest) |
| Build | `npm run build` | ✅ Pass | Vite 7 production build, 4190 modules |
| Typecheck | `npx tsc --noEmit` | ❌ Fail | ~124 errors; all are domain-level TS debt, not platform config |

### Why `tsc --noEmit` still fails

`ts-platform-foundation` removed the platform blockers (`baseUrl` deprecation, missing Vite client types, CSS import errors). What remains is unrelated application debt:

- `NotificationItem` type missing / misnamed
- `PageProps` shape mismatches with Inertia's expected `flash` + `errors`
- Implicit `any` in auth page handlers (`e`, `status`, `canResetPassword`)
- `ProjectStatus` typing gaps in `project-status-manager.tsx`
- Fixture shape mismatches in tests (`message` missing on `JoinRequest`)
- `RefObject<T | null>` vs `RefObject<T>` in `use-in-view-once.ts`

All of this is pre-existing and outside the scope of the current frontend branch.

---

## Affected Areas

- `.github/workflows/frontend.yml` — **create** (new CI pipeline)
- `openspec/config.yaml` — **modify** (`quality.type_checker` should reflect the staged state: `tsc` with a note that it is not yet a hard gate)

---

## Approaches

### Approach A — Staged Gate (Recommended)

Create a single workflow with two jobs:

1. **Hard gate job** — runs on `ubuntu-latest`, checks out code, runs `npm ci`, `npm run build`, `npm test`. Any failure blocks the PR.
2. **Informational job** — runs `npx tsc --noEmit` with `continue-on-error: true` (or as a separate job that does not appear in the required status checks). The output is visible in PR checks but does not block merge.

- **Pros**: Protects regressions immediately for tests and build; surfaces typecheck failures so debt is visible; does not break existing PRs.
- **Cons**: Type errors continue to accumulate until someone fixes the debt and flips the gate.
- **Effort**: Low (~30–40 lines of YAML)

### Approach B — Full Typecheck Gate Now

Add `npx tsc --noEmit` as a hard gate in the same workflow.

- **Pros**: Forces immediate type safety; prevents new debt.
- **Cons**: Every open PR and every new PR would fail CI until ~124 errors are fixed. That is a massive scope explosion for this branch and would stall all frontend work.
- **Effort**: High (requires fixing all domain TS debt first)

### Approach C — No CI (Defer)

Leave `.github/workflows` empty and rely on local runs.

- **Pros**: Zero files changed; no risk of breaking PRs.
- **Cons**: No automated protection against test or build regressions; no visibility into typecheck debt; contradicts the project convention of CI gating.
- **Effort**: None

---

## Recommendation

**Adopt Approach A.**

Create `.github/workflows/frontend.yml` with:

- `npm ci` → `npm run build` → `npm test` as a required, blocking job.
- `npx tsc --noEmit` as a separate, non-blocking job (or same job with `continue-on-error: true`), labeled clearly as "Typecheck (informational)".
- A YAML comment documenting the exact condition to flip the gate: "When `npx tsc --noEmit` exits 0, remove `continue-on-error` and make this job required."

This is the smallest coherent CI change for this branch: it protects what is already green (tests, build) and stages what is not (typecheck), without scope creep into unrelated TypeScript cleanup.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Typecheck job failures desensitize the team | Medium | Name the check "Typecheck (informational — debt tracked)" and link to the planned TS-debt cleanup change in the workflow comments |
| `npm ci` duration or cache misses | Low | Use `actions/setup-node` with built-in caching; the repo has a standard `package-lock.json` |
| Build job passes locally but fails in CI | Low | Ubuntu runner + same Node version as local; no native dependencies observed |

---

## Ready for Proposal

**Yes.**

The orchestrator should proceed to `sdd-propose` with the scope locked to:

1. Create `.github/workflows/frontend.yml`
2. Optionally update `openspec/config.yaml` to reflect the staged type-checker state

Everything else (fixing the 124 domain TS errors) is an explicitly separate change that should come **after** this CI gate is in place.

---

## Likely Files to Change

1. `.github/workflows/frontend.yml` — **create** (~30–40 lines)
2. `openspec/config.yaml` — **modify** (update `quality.type_checker` and/or add a rule note)
