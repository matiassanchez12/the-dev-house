# Exploration: ts-shared-app-types

## Executive Summary

The shared TypeScript/app-shell layer has **7 type errors** out of **66 total** in the codebase. These are concentrated in 4 files that form the app's structural foundation: the layout shell (`app-layout`), the notification system (`notification-bell`, `notification-list`), and two universally-imported UI primitives (`dropdown`, `field`).

All errors are **compile-time only** — zero runtime impact. One focused PR is realistic: ~60 changed lines across 4 files, well under the 400-line review budget.

---

## Quick Path

1. Fix `notification-bell.tsx`: import `NotificationItem`, extend Inertia `PageProps`, type `setInterval` as `number`
2. Fix `dropdown.tsx`: replace `DropdownMenuContent.Props` with `React.ComponentPropsWithoutRef`
3. Fix `field.tsx`: cast `children` to `ReactElement<any>` before `cloneElement`
4. Fix `app-layout.tsx`: pass `auth` shape generic to `usePage()`
5. Run `npx tsc --noEmit` and confirm the 7 shared errors are gone

---

## Current State

`npx tsc --noEmit` reports **66 errors** total. After filtering to the shared/app-shell domain, **7 errors remain** across 4 files:

### Error Inventory (Shared Scope)

| File | Line | Error | TS Code | Count |
|------|------|-------|---------|-------|
| `notification-bell.tsx` | 17 | `Cannot find name 'NotificationItem'` | TS2552 | 2 |
| `notification-bell.tsx` | 28 | `Type 'PageProps' does not satisfy the constraint` | TS2344 | 1 |
| `notification-bell.tsx` | 65 | `Type 'number' is not assignable to type 'Timeout'` | TS2322 | 1 |
| `dropdown.tsx` | 20 | `Cannot find namespace 'DropdownMenuContent'` | TS2503 | 1 |
| `field.tsx` | 21 | `No overload matches this call` (cloneElement) | TS2769 | 1 |
| `app-layout.tsx` | 21 | `Property 'user' does not exist on type '{}'` | TS2339 | 1 |

### Error Details

#### `notification-bell.tsx`

**Problem 1 — Forward reference of `NotificationItem` (line 17):**
The local `PageProps` interface uses `NotificationItem` before it is available in scope. Line 21 has `export type { NotificationItem } from '@/components/notification-list'` — a re-export, not an import. The type is not hoisted into module scope for the interface definition.

**Problem 2 — `PageProps` lacks index signature (line 28):**
`usePage<PageProps>()` requires its generic to extend Inertia's `PageProps`, which carries `[key: string]: unknown`. The local `interface PageProps` declares only `auth`, `notifications`, and `url`, so it fails the `extends` constraint.

**Problem 3 — `setInterval` return type mismatch (line 65):**
`titleIntervalRef` is typed as `useRef<ReturnType<typeof window.setInterval> | null>(null)`. In this environment `ReturnType<typeof window.setInterval>` resolves to `Timeout` (likely NodeJS types leaking through ambient declarations), but the actual DOM API returns `number`.

#### `dropdown.tsx`

**Problem — Namespace type reference (line 20):**
```tsx
}: DropdownMenuContent.Props & { children?: React.ReactNode }
```
`@radix-ui/react-dropdown-menu` exports `DropdownMenuContent` as a `React.ForwardRefExoticComponent`. It does not export a namespace with a `Props` property. The correct pattern is `React.ComponentPropsWithoutRef<typeof DropdownMenuContent>`.

#### `field.tsx`

**Problem — `cloneElement` overload rejection (line 21):**
```tsx
cloneElement(children as ReactElement, { id, 'aria-invalid': ..., 'aria-describedby': ... })
```
After `isValidElement(children)`, TypeScript narrows `children` to `ReactElement<unknown, any>`. `cloneElement` does not accept `id` on `unknown` props. A more permissive cast (e.g., `ReactElement<any>` or `ReactElement<Record<string, unknown>>`) resolves the overload.

#### `app-layout.tsx`

**Problem — `usePage()` without typed `auth` (line 21):**
```tsx
const user = (usePage().props.auth?.user as User | null | undefined) ?? null;
```
`usePage()` with no generic returns `Page<PageProps>`. The globally-augmented `PageProps` (in `global.d.ts`) includes `flash` and `errors` but not `auth`. The `.auth` property resolves through the index signature `[key: string]: unknown` as `unknown`, and the subsequent optional-chained `.user` access fails.

---

## Affected Areas

### In Scope (Shared / App-Shell)

| File | Role | Why It Matters |
|------|------|----------------|
| `resources/js/components/notification-bell.tsx` | Global notification indicator | Used in every authenticated layout render; breaks `usePage` + local type patterns |
| `resources/js/components/notification-list.tsx` | Notification dropdown content | No direct errors, but is the source of `NotificationItem` type; coupled to bell |
| `resources/js/layouts/app-layout.tsx` | Root authenticated layout | Every page inherits this; `usePage` typing affects all child routes |
| `resources/js/components/ui/dropdown.tsx` | Base dropdown primitive | Consumed by `app-layout` (account menu) and `notification-bell` (notification menu) |
| `resources/js/components/ui/field.tsx` | Base form field wrapper | Consumed by 10 files across auth, profile, and onboarding domains |

### Out of Scope (Domain-Specific)

| File | Domain | Reason Excluded |
|------|--------|-----------------|
| `resources/js/pages/auth/*.tsx` | Auth | Login/register/verify pages — separate auth-type change |
| `resources/js/pages/profile/**/*.tsx` | Profile | Profile edit, password, social links — separate profile-type change |
| `resources/js/pages/projects/*.tsx` | Projects | Project index, status manager, join form — separate project-type change |
| `resources/js/pages/onboarding/*.tsx` | Onboarding | Onboarding flow — separate onboarding-type change |
| `resources/js/pages/join_requests/*.tsx` | Join Requests | Request management — separate domain change |
| `resources/js/pages/milestones.tsx` | Milestones | Milestone display — separate domain change |
| `resources/js/components/user/user-card.tsx` | Users | User discovery card — separate users change |
| `resources/js/components/ui/svgs/kubernetes-icon.tsx` | UI/SVG | One-off SVG typing issue — not structural |
| `resources/js/components/landing/hero/hooks/use-in-view-once.ts` | Landing | Landing page hook — not app-shell |

---

## Approaches

### Approach A — Per-File Targeted Fixes (Recommended)

Fix each error at its source without cross-file refactors.

1. **`notification-bell.tsx`**:
   - Add `import type { NotificationItem } from '@/components/notification-list'` at top
   - Make local `PageProps` extend Inertia's `PageProps` (or add `[key: string]: unknown`)
   - Change `ReturnType<typeof window.setInterval>` to `number`

2. **`dropdown.tsx`**:
   - Replace `DropdownMenuContent.Props` with `React.ComponentPropsWithoutRef<typeof DropdownMenuContent>`

3. **`field.tsx`**:
   - Cast `children` to `ReactElement<any>` before `cloneElement`

4. **`app-layout.tsx`**:
   - Use `usePage<{ auth?: { user: User | null } }>()` instead of bare `usePage()`

- **Pros**: Minimal blast radius; no runtime changes; preserves existing patterns; each fix is ~5–15 lines
- **Cons**: `PageProps` pattern is still ad-hoc per file (no shared `AppPageProps` abstraction)
- **Effort**: Low

### Approach B — Extract Shared `AppPageProps` Type

Create a central `AppPageProps` in `resources/js/types/index.ts` that extends Inertia's `PageProps` with `auth`, `notifications`, and `url`, then refactor all consumers.

- **Pros**: Eliminates duplicated local `PageProps` declarations; one source of truth for page prop shapes
- **Cons**: Touches many out-of-scope files (auth pages, profile pages, etc.); would balloon past the 400-line budget; requires coordinating with domain-specific changes
- **Effort**: Medium–High

### Approach C — Ignore + Suppress

Add `// @ts-expect-error` or `// @ts-ignore` annotations at each error site.

- **Pros**: Fastest; zero risk of regression
- **Cons**: Hides real type issues; accumulates technical debt; makes future refactors harder
- **Effort**: Trivial (not recommended)

---

## Recommendation

**Adopt Approach A.**

Rationale:
- The shared layer is a narrow slice (7 errors, 4 files). Approach A resolves every error without touching domain-specific code.
- Approach B is architecturally desirable but would force in-scope changes into out-of-scope files, violating the single-change contract. A central `AppPageProps` should be introduced as part of a later, broader TypeScript hygiene change after the domain-specific errors are fixed.
- Approach C is unacceptable for a codebase that mandates strict TypeScript.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `field.tsx` cast to `any` weakens type safety for `id` propagation | Low | Low | The cast only affects the `cloneElement` call site; runtime behavior is unchanged; add a unit test for `Field` if none exists |
| `app-layout.tsx` `usePage` generic drifts from backend prop shape | Low | Medium | The generic only adds `auth` — all other props still flow through the index signature; backend contract change would surface in page-level errors, not layout |
| `notification-bell.tsx` `setInterval` `number` type conflicts with NodeJS types in CI | Low | Low | Use `ReturnType<typeof setTimeout>` instead of `window.setInterval` — both resolve to `number` in browser types and avoid NodeJS.Timeout ambiguity |
| Future domain changes re-introduce similar `usePage` errors | Medium | Low | Document the `extends PageProps` / index-signature requirement in `AGENTS.md` conventions |

---

## Ready for Proposal

**Yes.**

The scope is locked to 4 files and 7 errors. One PR is realistic at ~60 changed lines. The orchestrator should proceed to `sdd-propose` with the understanding that this change is a **foundation-hardening slice** — it does not resolve the full 66-error backlog, but it unblocks the shared infrastructure so that domain-specific changes can proceed in parallel without shared-component type failures cascading into their builds.

---

## Likely Files to Change

1. `resources/js/components/notification-bell.tsx` — **modify** (import fix + PageProps fix + setInterval fix)
2. `resources/js/components/ui/dropdown.tsx` — **modify** (namespace → ComponentPropsWithoutRef)
3. `resources/js/components/ui/field.tsx` — **modify** (cloneElement typing)
4. `resources/js/layouts/app-layout.tsx` — **modify** (usePage generic)

---

## Verification Checklist (for Proposal/Spec)

- [ ] `npx tsc --noEmit` no longer reports TS2552 on `NotificationItem`
- [ ] `npx tsc --noEmit` no longer reports TS2344 on `PageProps` in `notification-bell.tsx`
- [ ] `npx tsc --noEmit` no longer reports TS2322 on `Timeout` in `notification-bell.tsx`
- [ ] `npx tsc --noEmit` no longer reports TS2503 on `DropdownMenuContent`
- [ ] `npx tsc --noEmit` no longer reports TS2769 on `cloneElement` in `field.tsx`
- [ ] `npx tsc --noEmit` no longer reports TS2339 on `user` in `app-layout.tsx`
- [ ] `npm run build` still succeeds
- [ ] No new TypeScript errors introduced

---

*Exploration completed: 2026-07-09*
*Method: file inspection + `tsc` error filtering + dependency graph analysis*
