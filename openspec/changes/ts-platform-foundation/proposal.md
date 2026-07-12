# Proposal: TypeScript Platform Foundation

Fix platform-level TypeScript blockers so `tsc --noEmit` passes cleanly with zero runtime impact.

## Quick Path

1. Create `resources/js/types/vite-env.d.ts` with `/// <reference types="vite/client" />`
2. Remove deprecated `baseUrl` from `tsconfig.json`
3. Fix `@components/*` path to `./resources/js/components/*`
4. Verify `npm run build` and `npx tsc --noEmit` both pass

## Intent

`npx tsc --noEmit` currently reports one tsconfig error and three platform-level type errors in `app.tsx`:

| Error | File | Description |
|---|---|---|
| TS5101 | `tsconfig.json` | `baseUrl` is deprecated and will stop functioning in TS 7.0 |
| TS2882 | `app.tsx` | CSS side-effect import has no type declaration |
| TS2339 | `app.tsx` | `import.meta.env` does not exist on `ImportMeta` |
| TS2339 | `app.tsx` | `import.meta.glob` does not exist on `ImportMeta` |

These errors block the type-check gate for the entire project. The fix is three lines of configuration and one new type declaration file. No application code changes.

## Scope

### In Scope
- Add Vite client typings in a dedicated `.d.ts` file
- Remove deprecated `baseUrl` from `tsconfig.json`
- Adjust `paths` so the TS config remains valid without `baseUrl`

### Out of Scope
- Domain-specific TypeScript errors (e.g., page or component logic)
- Backend or UI changes
- Cleanup of tests, components, or pages outside the platform layer

## Capabilities

### New Capabilities
<!-- None — pure configuration fix, no new behavior. -->
None.

### Modified Capabilities
<!-- None — existing behavior unchanged; only type-checking environment fixed. -->
None.

## Approach

Adopt **Approach A (Minimal Fix)** from exploration.

Rationale: `vite/client` is the official, maintained source of truth for Vite-specific types. `baseUrl` is deprecated because `moduleResolution: "bundler"` handles resolution natively. The migration cost is one `./` prefix on the `@components/*` path. Empirically validated: all four errors disappear and no new errors are introduced.

## Affected Areas

| File | Impact | Description |
|---|---|---|
| `tsconfig.json` | Modify | Remove `baseUrl` line; fix `@components/*` path entry |
| `resources/js/types/vite-env.d.ts` | Create | Add `/// <reference types="vite/client" />` |
| `vite.config.js` | Verify only | Confirm aliases use absolute paths, independent of TS `paths` |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `@components/*` path change breaks Vite alias resolution | Low | Vite aliases use absolute paths in `vite.config.js`; verified independent of TS `paths` |
| Other non-relative imports hidden from type-check | Low | Search confirmed all non-relative imports are `paths` aliases or `node_modules` packages |
| `vite-env.d.ts` not covered by `include` | Low | Current `include` has `"resources/js/**/*.d.ts"` which matches the new file location |

## Rollback Plan

Revert the two commits (or a single commit) that modify `tsconfig.json` and create `vite-env.d.ts`. No data migration, no API change, no runtime state to worry about.

## Dependencies

- None external. Requires existing `vite` package (already installed).

## Success Criteria

- [ ] `npx tsc --noEmit` no longer reports TS5101 (`baseUrl` deprecation)
- [ ] `npx tsc --noEmit` no longer reports TS2882 (CSS import)
- [ ] `npx tsc --noEmit` no longer reports TS2339 on `ImportMeta.env`
- [ ] `npx tsc --noEmit` no longer reports TS2339 on `ImportMeta.glob`
- [ ] `npm run build` still succeeds
- [ ] No new TypeScript errors introduced