# Tasks: Frontend CI Gates

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

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add the frontend CI workflow and staged typecheck gating | PR 1 | Base on `development`; keep tests/build blocking and typecheck informational |

## Phase 1: Workflow Foundation

- [x] 1.1 Create `.github/workflows/frontend.yml` with PR/push triggers, Node setup, lockfile install, and cache enabled.
- [x] 1.2 Define the blocking job steps: checkout, `npm ci`, `npm run build`, and `npm test` in that order.

## Phase 2: Gate Behavior

- [x] 2.1 Add a separate `npx tsc --noEmit` job marked `continue-on-error: true` so existing domain TS debt is visible but non-blocking.
- [x] 2.2 Name the typecheck job clearly as informational and add a YAML comment stating when to flip it to a hard gate.
- [x] 2.3 Update `openspec/config.yaml` if needed so `quality.type_checker` reflects the staged typecheck state.

## Phase 3: Verification

- [x] 3.1 Run `npm ci && npm run build && npm test` locally to confirm the hard-gated checks match CI.
- [x] 3.2 Run `npx tsc --noEmit` locally and confirm failures remain informational rather than blocking the workflow.
- [x] 3.3 Validate the workflow file parses cleanly and exposes only the intended blocking checks for frontend PRs.
