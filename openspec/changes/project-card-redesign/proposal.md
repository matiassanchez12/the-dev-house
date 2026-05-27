# Proposal: Project Card Redesign & Show Page Decomposition

## Intent

`ProjectCard` lacks image preview, has a weak featured variant, and duplicates `statusConfig` + `getInitials()` with `show.tsx` (361 lines, monolithic). The `closed` status has no styling. This change extracts shared utils, decomposes the show page, and redesigns the card.

## Scope

### In Scope
- Extract `statusConfig` + `getInitials()` → `components/projects/project-utils.ts`
- Create `project-status-badge.tsx` reusable component
- Split `show.tsx` into 11 section components under `components/projects/show/`
- Redesign `ProjectCard` with image thumbnail, meta row, improved featured variant
- Refactor `show.tsx` to compose extracted components (~80 lines target)

### Out of Scope
- Backend changes (controllers, services, models)
- New API endpoints or data fetching
- Database schema changes
- Other pages or components

## Capabilities

### New Capabilities
None — pure frontend refactor, no new user-facing capabilities.

### Modified Capabilities
- `app`: UI component requirements updated — `statusConfig` becomes shared utility; `ProjectCard` gains image thumbnail and enhanced featured variant; `show.tsx` decomposed into section components.

## Approach

Four sequential phases:

1. **Extract shared utils** — `statusConfig` (fix `closed` styling), `getInitials()` → `project-utils.ts`. Update both consumers.
2. **Create status badge** — `project-status-badge.tsx` wraps Badge + icon. Replace inline patterns.
3. **Split show page** — Extract 11 section components under `components/projects/show/`.
4. **Redesign ProjectCard** — Add image thumbnail, meta row, stronger featured variant with border accent.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/projects/project-card.tsx` | Modified | Redesign with image, meta row, featured variant |
| `components/projects/project-utils.ts` | New | Shared `statusConfig`, `getInitials()` |
| `components/projects/project-status-badge.tsx` | New | Reusable status badge component |
| `components/projects/show/` | New (11 files) | Section components extracted from show.tsx |
| `pages/projects/show.tsx` | Modified | Refactored to compose section components (~80 lines) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prop drilling across 11 components | Medium | Flat TypeScript interfaces per project conventions |
| `closed` status styling regression | Low | Use explicit `bg-muted text-foreground` from show.tsx |
| PR exceeds 400-line review budget | High | ~400-500 lines — recommend chained PRs |

## Rollback Plan

Revert the single PR (or all chained PRs) — no database or backend changes. The original `project-card.tsx` and `show.tsx` are preserved in git history. No data migration needed.

## Dependencies

- None — frontend-only change, no backend prerequisites.

## Success Criteria

- [ ] `statusConfig` and `getInitials()` in single location (`project-utils.ts`)
- [ ] `show.tsx` under 100 lines after decomposition
- [ ] `ProjectCard` displays image thumbnail when available
- [ ] `closed` status has visible styling
- [ ] Featured variant has distinct visual treatment
- [ ] All existing tests pass
