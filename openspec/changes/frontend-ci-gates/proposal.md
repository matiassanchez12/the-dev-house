# Proposal: Frontend CI Gates

## Intent

The repository has zero frontend CI. `npm test` (54 tests) and `npm run build` pass locally, but nothing prevents regressions on pull requests. Meanwhile, `npx tsc --noEmit` emits ~124 domain-level TypeScript errors that are explicitly out of scope for this branch. We need a minimal workflow that hard-gates what is already green and soft-gates what is not, without scope creep into fixing unrelated TS debt.

## Scope

### In Scope
- Create `.github/workflows/frontend.yml` with hard gates for `npm test` and `npm run build`
- Add an informational (non-blocking) typecheck job via `npx tsc --noEmit`
- Update `openspec/config.yaml` to reflect the staged type-checker state
- Document the exact condition to flip the typecheck gate to hard

### Out of Scope
- Fixing the ~124 domain TypeScript errors
- Backend CI (PHP tests, Pint, etc.)
- Deployment pipelines
- Broader workflow architecture (matrix builds, multiple Node versions, etc.)

## Capabilities

### New Capabilities
None — this is a pure CI infrastructure change with no spec-level behavior changes.

### Modified Capabilities
None — no existing capability requirements are changing.

## Approach

Adopt a **staged gate** strategy:

1. **Hard gate job** — `npm ci` → `npm run build` → `npm test`. Any failure blocks the PR.
2. **Informational job** — `npx tsc --noEmit` with `continue-on-error: true`. Output is visible but does not block merge. A YAML comment documents the condition to remove `continue-on-error` once domain debt is cleared.

Use `actions/setup-node` with built-in caching. Target `ubuntu-latest`. No matrix required.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/frontend.yml` | New | Single workflow file with build/test/typecheck jobs |
| `openspec/config.yaml` | Modified | Update `quality.type_checker` from `null` to `tsc` with a staged note |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Typecheck job failures desensitize the team | Medium | Label check "Typecheck (informational — debt tracked)" and link to the planned TS-debt cleanup change |
| `npm ci` duration or cache misses | Low | Use `actions/setup-node` with built-in caching |
| Build passes locally but fails in CI | Low | Same Node version as local; no native dependencies observed |

## Rollback Plan

Delete `.github/workflows/frontend.yml` and revert the `openspec/config.yaml` change. CI checks disappear immediately; no code changes are required.

## Dependencies

None.

## Success Criteria

- [ ] PRs trigger the frontend workflow automatically
- [ ] `npm test` and `npm run build` failures block merge
- [ ] `npx tsc --noEmit` runs and reports results without blocking merge
- [ ] `openspec/config.yaml` accurately documents the staged type-checker state
