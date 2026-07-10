# Proposal: TypeScript Projects Domain Typing Fixes

## Intent

The projects domain currently has **18 TypeScript errors** across **7 files** that block the frontend CI gate (`npx tsc --noEmit`). All errors are type-level mismatches between fixtures, component prop interfaces, and UI library signatures. No runtime bugs are involved. This change makes the projects domain type-clean and unblocks CI.

## Scope

### In Scope
- `project-status-manager` — fix `Record<ProjectStatus, …>` missing `'all'` key and implicit `any` cascade.
- `projects/index` — handle `@base-ui/react/select` `onValueChange` nullable `string | null` signature.
- `projects/show` — align `auth.user` partial typing with full `User` interface; fix `viewerJoinRequest.message` optional vs required mismatch.
- Test fixtures — add missing fields (`message`, timestamps, `created_projects_count`) to inline test objects in `project-join-form.test`, `collaborators.test`, `collaborator-suggestion-card.test`, and `show.test`.
- `global.d.ts` — change `const route` to `var route` so dynamic `globalThis.route` access in tests is typed.

### Out of Scope
- Other domains or global type relaxation.
- Runtime behavior changes.
- Introducing fixture factories or refactoring component logic.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None (type-only fix; no spec-level requirement changes)

## Approach

**Approach A — Minimal type-only fixes.**

Align existing code to already-established contracts without relaxing shared types globally or adding new abstractions:

1. **Select handlers** — Wrap `setSelectedTech` / `setSelectedStatus` to accept `string | null` and coerce to `''`.
2. **`auth.user`** — Type page `Props.auth.user` as `User | null` instead of a partial literal.
3. **`viewerJoinRequest.message`** — Make `message` optional in `ProjectJoinFormProps` to match the `Project` type definition.
4. **Transitions Record** — Change type to `Record<ProjectStatus, ProjectStatus[]> & { all: ProjectStatus[] }`.
5. **Fixtures** — Complete inline test objects with missing fields.
6. **`globalThis.route`** — Change `const route` to `var route` in `global.d.ts`.
7. **`show.test.tsx`** — Add manual type guard before accessing `capturedJoinFormProps`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/projects/index.tsx` | Modified | Select `onValueChange` nullable handling |
| `resources/js/pages/projects/show.tsx` | Modified | `auth.user` and `viewerJoinRequest` typing |
| `resources/js/components/projects/show/project-status-manager.tsx` | Modified | Record typing for transitions |
| `resources/js/components/projects/show/project-join-form.test.tsx` | Modified | Fixture completeness |
| `resources/js/pages/projects/collaborators.test.tsx` | Modified | Fixture user fields |
| `resources/js/components/projects/collaborator-suggestion-card.test.tsx` | Modified | Tech timestamps + `globalThis.route` |
| `resources/js/pages/projects/show.test.tsx` | Modified | Type guard for captured props |
| `resources/js/types/global.d.ts` | Modified | `var route` binding |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `global.d.ts` change affects other domains | Low | Verify `tsc --noEmit` still passes globally after the change |
| Scope creep into runtime refactoring | Low | PR review enforces 400-line budget; reject non-type changes |

## Rollback Plan

Revert the single PR. No migrations or state changes are involved.

## Dependencies

- None

## Success Criteria

- [ ] `npx tsc --noEmit` passes for the projects domain with zero errors.
- [ ] No runtime behavior changes — existing tests pass without modification to assertions.
- [ ] PR changed lines remain under the 400-line review budget.
