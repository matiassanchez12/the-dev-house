# Design: Frontend CI Gates

## Technical Approach

Add one narrow GitHub Actions workflow for the existing npm frontend surface. The workflow hard-gates the currently green checks (`npm run build`, `npm test`) and runs TypeScript as a separate informational check because `npx tsc --noEmit` still fails on pre-existing domain typing debt. The OpenSpec config should document this staged state so future SDD verification knows `tsc` exists but is not yet a required gate.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Workflow placement | Create `.github/workflows/frontend.yml` | Split workflows by build/test/typecheck | One workflow is enough for a narrow frontend gate and keeps branch protection simple. |
| Triggers | `pull_request` and `push` for `development` and `master` | Run on every branch push | PRs are the main review boundary; protected branch pushes catch post-merge regressions without burning CI on every feature branch push. |
| Node setup | Use `actions/setup-node` with Node 22 and `cache: npm` | Matrix or unpinned latest Node | Vite 7 requires modern Node; Node 22 is stable and avoids matrix complexity. `package-lock.json` supports deterministic `npm ci` and setup-node npm cache. |
| Hard gate shape | One `frontend` job: checkout → setup-node → `npm ci` → `npm run build` → `npm test` | Separate build and test jobs | Single install keeps the workflow minimal and matches the proposal's command order. |
| Typecheck gate | Separate `typecheck-informational` job with `continue-on-error: true` | Hard-gate `tsc` now; hide it in the hard-gate job | Existing domain errors would block all PRs. A separate allowed-to-fail job keeps the debt visible without weakening build/test enforcement. |
| Documentation | Update `openspec/config.yaml` `testing.quality.type_checker` to document staged `tsc --noEmit` | Leave `type_checker: null` | `null` would be misleading once CI runs typecheck informationally. |

## Data Flow

```text
GitHub event
  ├─ frontend job ── checkout ── setup-node/cache ── npm ci ── build ── test ── required result
  └─ typecheck-informational job ── checkout ── setup-node/cache ── npm ci ── tsc ── allowed failure
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/frontend.yml` | Create | Defines frontend CI triggers, Node/npm setup, hard build/test gate, and informational typecheck job. |
| `openspec/config.yaml` | Modify | Set `testing.quality.type_checker` to document `npx tsc --noEmit` as informational until domain TS debt is cleared. |

## Interfaces / Contracts

Workflow contract:

```yaml
name: Frontend CI
on:
  pull_request:
    branches: [development, master]
  push:
    branches: [development, master]
```

Both jobs use `actions/checkout`, `actions/setup-node` with `node-version: 22` and `cache: npm`, then `npm ci`. The hard job runs `npm run build` before `npm test`. The typecheck job runs `npx tsc --noEmit`, is named clearly as informational, and includes a comment: remove `continue-on-error` and make the job required only after `npx tsc --noEmit` exits 0 locally and in CI.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Static workflow review | YAML syntax, triggers, job names, command order | Inspect `.github/workflows/frontend.yml` before merge. |
| CI integration | Build/test block failures | Open PR and confirm the `frontend` job reports required status. |
| Informational CI | Typecheck output visible but non-blocking | Confirm `typecheck-informational` can fail without failing the workflow run. |

## Migration / Rollout

No data migration required. Roll out by merging the workflow. Branch protection should require only the hard `frontend` job until TypeScript debt is fixed.

## Open Questions

- [ ] None.
