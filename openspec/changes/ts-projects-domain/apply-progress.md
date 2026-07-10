# Apply Progress: TS Projects Domain

## Summary

- Typed project-status-manager Record key handling and implicit any
- Normalized nullable Select handlers in projects/index
- Typed partial auth user and viewerJoinRequest in projects/show
- Fixed test fixtures across 4 project test files
- Updated global.d.ts route binding

## TDD Cycle Evidence

| Scope | Red | Green | Refactor |
|---|---|---|---|
| Status manager typing | Captured baseline 'all' key errors and implicit any | Verified errors disappear after extending Record and annotating status | No runtime change |
| Select nullable handling | Captured baseline Dispatch<SetStateAction> mismatch | Verified errors disappear after normalizing value ?? '' | Keeps behavior identical |
| Show page partial types | Captured baseline auth/viewerJoinRequest partial type errors | Verified errors disappear after adding partial User and Pick types | No runtime change |
| Test fixtures | Captured baseline missing timestamp/property errors in 4 files | Verified errors disappear after adding required fields | Fixtures now match strict interfaces |

## Files Changed

- resources/js/pages/projects/index.tsx
- resources/js/pages/projects/show.tsx
- resources/js/components/projects/show/project-status-manager.tsx
- resources/js/components/projects/show/project-join-form.tsx
- resources/js/components/projects/show/project-join-form.test.tsx
- resources/js/pages/projects/collaborators.test.tsx
- resources/js/components/projects/collaborator-suggestion-card.test.tsx
- resources/js/pages/projects/show.test.tsx
- resources/js/types/global.d.ts

## Verification Notes

- npx tsc --noEmit — zero projects-domain errors remain
- npm run build — passes
- 4 project test files — 11/11 tests passed
- npx tsc --noEmit overall still fails on unrelated domain errors outside projects
