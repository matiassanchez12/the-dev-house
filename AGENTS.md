# Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms. This is a Laravel + React + Inertia.js monolith.
- Component docs override this file when guidance conflicts.

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (Any Project)
| Skill | Description | URL |
|-------|-------------|-----|
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `react-19` | No useMemo/useCallback, React Compiler | [SKILL.md](skills/react-19/SKILL.md) |
| `tailwind-4` | cn() utility, no var() in className | [SKILL.md](skills/tailwind-4/SKILL.md) |
| `vitest` | Unit testing, React Testing Library | [SKILL.md](skills/vitest/SKILL.md) |
| `tdd` | Test-Driven Development workflow | [SKILL.md](skills/tdd/SKILL.md) |
| `zod-4` | New API (z.email(), z.uuid()) | [SKILL.md](skills/zod-4/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Committing changes | `prowler-commit` |
| Creating API endpoints | `jsonapi` |
| Creating Zod schemas | `zod-4` |
| Creating new skills | `skill-creator` |
| Fixing bug | `tdd` |
| Implementing feature | `tdd` |
| Modifying component | `tdd` |
| Refactoring code | `tdd` |
| Running tests | `tdd` |
| Working on task | `tdd` |
| Writing React component tests | `vitest` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |
| Writing Vitest tests | `vitest` |
| Working with Tailwind classes | `tailwind-4` |

## Project Conventions

### Backend (Laravel 12)

- **Controllers**: One controller per resource. Validation first, logic second, Inertia response last.
- **Form Requests**: Use dedicated `FormRequest` classes when validation has >10 rules.
- **Models**: `use HasFactory;` required. Relationships before custom methods. `$fillable` sorted alphabetically.
- **Migrations**: One migration per table change. Never modify existing migrations — create new ones.
- **Naming**: `ProjectController`, `ProjectTest`, `test_can_[action]_[entity]`.

### Frontend (React 18 + TypeScript + Inertia.js)

- **File naming**: `kebab-case` — `authenticated-layout.tsx`, `primary-button.tsx`
- **Component naming**: `PascalCase` — `export default function AuthenticatedLayout()`
- **Props**: Explicit interfaces, NO `any`. Types in `resources/js/types/index.ts`.
- **Component size**: Keep under 100 lines. Extract custom hooks for reusable logic.
- **UI**: Shadcn/ui for base components (`Components/ui/`). Tailwind for styling.
- **State**: React hooks + Inertia `useForm`. No Redux/Zustand for now.

### Testing (TDD — Mandatory)

- **Write tests FIRST**. Red → Green → Refactor.
- **Feature tests**: `tests/Feature/` for HTTP endpoints and integration.
- **Unit tests**: `tests/Unit/` for isolated logic.
- **Structure**: Arrange → Act → Assert. One concept per assert.
- **Isolation**: `use RefreshDatabase;` on every Feature test.
- **Coverage**: Minimum 80% on critical features.

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test --filter ProjectTest

# Run with coverage
php artisan test --coverage
```

### Git Workflow

- **Branches**: Create from `main`. Descriptive names: `feat/join-requests`, `fix/project-slug-validation`.
- **Commits**: Atomic, conventional commits:
  - `feat: add join request system`
  - `test: add ProjectController::index tests`
  - `fix: validate techs array is non-empty`
  - `refactor: extract tech selection hook`
- **PRs**: Must pass all tests. Include description of what changed and why.

## Architecture Decisions

1. **Evolutionary approach**: Start minimal, add complexity when justified. NO over-engineering.
2. **Normalized database**: Separate tables for techs (`techs`, `project_tech`, `user_tech`). NO JSON/ARRAY columns for relations.
3. **Inertia.js**: SPA without REST API. Laravel renders React directly.
4. **TDD mandatory**: Tests BEFORE code. No exceptions.
5. **TypeScript strict**: No `any` unless absolutely unavoidable.
