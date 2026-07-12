# Exploration: ts-platform-foundation

## Executive Summary

Three files, four lines changed, zero runtime impact.

The platform-level TypeScript blockers are:

1. **Missing Vite client type reference** → `import.meta.env` and `import.meta.glob` are untyped
2. **Missing CSS module declarations** → `import '../css/app.css'` fails type-check
3. **Deprecated `baseUrl`** → TS 6.0 warns; will break in TS 7.0

Empirically confirmed: removing `baseUrl` is safe if we fix one `paths` entry (`@components/*`). Adding `resources/js/types/vite-env.d.ts` with `/// <reference types="vite/client" />` eliminates all three `app.tsx` platform errors.

## Current State

`npx tsc --noEmit` currently emits **one** platform-level tsconfig error:

```
tsconfig.json(25,5): error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
```

With `--ignoreDeprecations 6.0`, the platform-level errors surface in `resources/js/app.tsx`:

```
app.tsx(1,8):  error TS2882: Cannot find module or type declarations for side-effect import of '../css/app.css'.
app.tsx(10,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
app.tsx(17,25): error TS2339: Property 'glob' does not exist on type 'ImportMeta'.
```

These errors cascade: any file using `import.meta.env` (e.g., `resources/js/components/seo.tsx`, `resources/js/lib/seo.ts`) also fails, but the root cause is identical.

## Affected Areas

| File | Why Affected |
|------|-------------|
| `tsconfig.json` | Contains deprecated `baseUrl`; `@components/*` path lacks leading `./` |
| `resources/js/app.tsx` | Side-effect CSS import + `import.meta.env` + `import.meta.glob` |
| `resources/js/types/vite-env.d.ts` | **Does not exist** — should reference `vite/client` types |
| `resources/js/components/seo.tsx` | Uses `import.meta.env` (secondary, same root cause) |
| `resources/js/lib/seo.ts` | Uses `import.meta.env` (secondary, same root cause) |

## Approaches

### Approach A — Minimal Fix (Recommended)

1. Create `resources/js/types/vite-env.d.ts` with `/// <reference types="vite/client" />`
2. Remove `baseUrl` from `tsconfig.json`
3. Fix `@components/*` path to `./resources/js/components/*`

- **Pros**: Smallest surface area; aligns with TS 6.0+ and Vite 7; zero runtime changes
- **Cons**: None identified
- **Effort**: Low

### Approach B — Keep baseUrl + ignoreDeprecations

Add `"ignoreDeprecations": "6.0"` to `tsconfig.json` and create `vite-env.d.ts`.

- **Pros**: No path changes needed; defers migration
- **Cons**: Kicks the can down the road; will break again at TS 7.0; adds technical debt
- **Effort**: Low

### Approach C — Manual declarations instead of Vite reference

Create a custom `env.d.ts` that manually declares `ImportMeta.env`, `ImportMeta.glob`, and CSS modules.

- **Pros**: No dependency on `vite/client` types
- **Cons**: Re-invents the wheel; must stay in sync with Vite upgrades; more lines, more risk
- **Effort**: Medium

## Recommendation

**Adopt Approach A.**

Rationale:
- `vite/client` is the official, maintained source of truth for Vite-specific types. It covers `env`, `glob`, hot module replacement, and asset modules.
- `baseUrl` has been deprecated by the TypeScript team because `moduleResolution: "bundler"` handles resolution natively. The migration cost here is literally one `./` prefix.
- The fix was empirically validated with a temporary tsconfig and temporary `vite-env.d.ts` — all three platform errors disappeared, and no new errors were introduced.

## Risks

| Risk | Mitigation |
|------|-----------|
| `@components/*` path change could break Vite alias resolution | Verify `vite.config.js` alias still resolves; it uses absolute path `/resources/js/components`, independent of TS `paths` |
| Other non-relative imports hidden from type-check | Search confirmed all non-relative imports are either `paths` aliases or `node_modules` packages |
| `vite-env.d.ts` location not covered by `include` | Current `include` has `"resources/js/**/*.d.ts"` which matches `resources/js/types/vite-env.d.ts` |

## Ready for Proposal

**Yes.**

The orchestrator should proceed to `sdd-propose` with confidence. The scope is locked, the fix is validated, and the file list is complete.

## Likely Files to Change

1. `resources/js/types/vite-env.d.ts` — **create** (1 line)
2. `tsconfig.json` — **modify** (remove `baseUrl`, fix `@components/*` path)
3. `vite.config.js` — **verify only** (no change expected; aliases use absolute paths)

## Verification Checklist (for Proposal/Spec)

- [ ] `npx tsc --noEmit` no longer reports TS5101 (baseUrl deprecation)
- [ ] `npx tsc --noEmit` no longer reports TS2882 (CSS import)
- [ ] `npx tsc --noEmit` no longer reports TS2339 on `ImportMeta.env`
- [ ] `npx tsc --noEmit` no longer reports TS2339 on `ImportMeta.glob`
- [ ] `npm run build` still succeeds
- [ ] No new TypeScript errors introduced

---

*Exploration completed: 2026-07-07*
*Method: file inspection + `tsc` empirical validation + temporary tsconfig test*
