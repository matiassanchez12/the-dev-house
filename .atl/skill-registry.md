# Skill Registry — dev-collab-platform
Generated: 2026-05-24
Source: AGENTS.md (project conventions)

## Auto-invoke Skills (Must load before action)

| Action | Skill | Purpose |
|--------|-------|---------|
| TDD workflow | `tdd` | Red→Green→Refactor, test-first |
| Fixing bug | `tdd` | Test-first bug fixing |
| Implementing feature | `tdd` | Test-first implementation |
| Running tests | `tdd` | Test execution workflow |
| React components | `react-19` | React 18 patterns, no useMemo/useCallback |
| TypeScript types | `typescript` | Strict types, flat interfaces |
| Tailwind classes | `tailwind-4` | cn() utility, no var() in className |
| React tests | `vitest` | React Testing Library |
| Vitest tests | `vitest` | Unit testing |
| Zod schemas | `zod-4` | New Zod API |
| Committing | `prowler-commit` | Conventional commits |

## Project Conventions (from AGENTS.md)

### Backend (Laravel 12)
- Controllers: validation → logic → Inertia response
- FormRequest for >10 validation rules
- Models: `use HasFactory;`, `$fillable` alphabetically
- Migrations: one per table change, never modify existing
- Naming: `ProjectController`, `test_can_[action]_[entity]`

### Frontend (React 18 + Inertia.js)
- File naming: `kebab-case.tsx`
- Component naming: `PascalCase`
- Props: explicit interfaces, NO `any`
- Component size: <100 lines
- UI: Shadcn/ui + Tailwind CSS
- State: React hooks + Inertia `useForm`

### Testing (Strict TDD — Mandatory)
- Write tests FIRST: Red → Green → Refactor
- Feature tests in `tests/Feature/`
- Unit tests in `tests/Unit/`
- Arrange → Act → Assert structure
- `use RefreshDatabase;` on every Feature test
- Minimum 80% coverage on critical features

### Git Workflow
- Branches from `main`: `feat/...`, `fix/...`
- Commits: conventional (`feat:`, `test:`, `fix:`, `refactor:`)
- PRs: must pass all tests