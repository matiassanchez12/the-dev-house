# Design: TypeScript Platform Foundation

## Technical Approach

Apply a platform-only TypeScript configuration fix: declare Vite's frontend type surface once, remove deprecated `baseUrl`, and keep existing aliases resolvable under `moduleResolution: "bundler"`. This maps directly to the app spec requirements for Vite client typings and TS 6 compatibility without changing runtime code.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Platform declaration boundary | Create `resources/js/types/vite-env.d.ts` with `/// <reference types="vite/client" />` | Add declarations to `global.d.ts`; create ad-hoc declarations for CSS, `ImportMeta.env`, and `ImportMeta.glob` | Vite-specific platform declarations should live in a small boundary file, separate from app/global augmentations. `vite/client` is Vite's maintained source of truth and covers CSS side-effect imports, asset modules, `ImportMetaEnv`, and `import.meta.glob` without reimplementing fragile custom types. |
| TS 6 config compatibility | Remove `baseUrl` from `tsconfig.json` | Keep `baseUrl` with `ignoreDeprecations`; defer until TS 7 | `baseUrl` is deprecated for this setup, while `moduleResolution: "bundler"` supports package and alias resolution without it. Existing paths already use relative targets except one entry, so removal is safe after normalizing that path. |
| Component alias target | Change `@components/*` from `resources/js/components/*` to `./resources/js/components/*` | Leave as-is; remove the alias | Without `baseUrl`, non-relative `paths` targets are not anchored to the repo root. Adding `./` makes the mapping explicit and consistent with `@/*`, `@layouts/*`, and `@pages/*`. |
| Verification boundary | Verify platform errors disappear, but do not fix domain TS debt | Expand scope to all TypeScript errors | The change exists to unblock platform declarations/configuration. Domain-specific errors are explicitly out of scope so the PR stays reviewable and does not hide unrelated application cleanup. |

## Data Flow

TypeScript reads the app sources and includes declaration files matched by `resources/js/**/*.d.ts`.

```text
tsconfig include ──→ resources/js/types/vite-env.d.ts ──→ vite/client
        │                         │
        │                         ├─ declares CSS/asset modules
        │                         └─ declares ImportMeta.env + glob
        └─ paths aliases ──→ explicit ./resources/js/* targets
```

Vite runtime resolution remains independent through `vite.config.js` aliases such as `@components: /resources/js/components`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/types/vite-env.d.ts` | Create | Platform declaration boundary that references `vite/client`. |
| `tsconfig.json` | Modify | Remove deprecated `baseUrl`; change `@components/*` to `./resources/js/components/*`. |
| `vite.config.js` | Verify only | Confirm runtime aliases remain absolute and do not depend on TS `paths`. |

## Interfaces / Contracts

```ts
/// <reference types="vite/client" />
```

This contract provides TypeScript support for Vite client features already used by `resources/js/app.tsx`, `resources/js/components/seo.tsx`, and `resources/js/lib/seo.ts`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Static | TS5101, CSS import, `ImportMeta.env`, and `ImportMeta.glob` platform errors | Run `npx tsc --noEmit`; platform errors must be absent. If remaining errors exist, classify them as domain debt only. |
| Build | Vite runtime alias and asset handling | Run `npm run build`. |
| Unit/E2E | Not applicable | No runtime behavior changes. |

## Migration / Rollout

No migration required. The rollout is a configuration-only change with rollback by reverting `tsconfig.json` and deleting `resources/js/types/vite-env.d.ts`.

## Open Questions

None.
