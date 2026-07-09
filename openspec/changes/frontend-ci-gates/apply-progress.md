# Apply Progress: Frontend CI Gates

## Summary

- Added narrow frontend CI workflow with one blocking job (build + test) and one informational typecheck job
- Updated OpenSpec config to document the staged `tsc` state
- Hard gates match local baseline; typecheck remains non-blocking because of pre-existing domain TS debt

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| Workflow syntax | Captured the absence of any frontend CI workflow in `.github/workflows/` | Verified the new `.github/workflows/frontend.yml` parses as valid YAML and runs the intended command order | Kept the workflow minimal: one blocking job + one clearly named informational job |
| Hard gate behavior | Captured the previous local baseline: `npm test` and `npm run build` were green but never enforced | Verified `npm run build` and `npm test` still pass locally and are now wired as the blocking job | Kept commands in spec order so failures are easy to triage |
| Informational typecheck | Captured the previous `npx tsc --noEmit` baseline: 67 remaining errors all in the repo domain layer | Verified the new `typecheck-informational` job isolates that command and uses `continue-on-error: true` plus a YAML comment explaining when to flip it | Kept the typecheck job as a separate job, not mixed into the hard gate, so the debt stays visible without weakening enforcement |

## Files Changed

- `.github/workflows/frontend.yml` (new)
- `openspec/config.yaml`

## Verification Notes

- `npm test`: 19 files / 54 tests passed
- `npm run build`: passed
- `npx tsc --noEmit`: 67 remaining errors, none of the platform-level ones this branch already removed
- YAML parse validated with `python3 -c "import yaml; yaml.safe_load(...)"`
</content>
