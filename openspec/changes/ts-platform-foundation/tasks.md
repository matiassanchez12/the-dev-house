# Tasks: TypeScript Platform Foundation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~8-20 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

One PR realistic: Yes

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Platform TS config + Vite typings cleanup | PR 1 | Base on the current branch; keep runtime behavior unchanged. |

## Phase 1: Platform Foundation

- [x] 1.1 Create `resources/js/types/vite-env.d.ts` with `/// <reference types="vite/client" />` so `import.meta.env`, `import.meta.glob`, and CSS imports are typed.
- [x] 1.2 Update `tsconfig.json` to remove `baseUrl` and change `@components/*` to `./resources/js/components/*`; leave the other `paths` entries unchanged.
- [x] 1.3 Verify `resources/js/types/` is already covered by `tsconfig.json` `include` and that `vite.config.js` needs no alias changes.

## Phase 2: Verification

- [x] 2.1 Run `npx tsc --noEmit` and confirm TS5101, TS2882, and both TS2339 `ImportMeta` errors are gone.
- [x] 2.2 Run `npm run build` to confirm the new type declaration and tsconfig cleanup do not affect the production bundle.

## Phase 3: Cleanup / Documentation

- [x] 3.1 Keep the diff limited to platform files only; do not touch domain-specific types or component logic.
