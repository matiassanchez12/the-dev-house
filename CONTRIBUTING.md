# Contributing Guide

Thank you for wanting to contribute to this project. This guide covers everything you need to make your first contribution.

## Quick Start

1. Fork the repository and clone your fork.
2. Set up the project (see [README.md](./README.md)).
3. Run `php artisan test` — all tests must pass before you start.
4. Create a `feat/*` or `fix/*` branch from `development` with a descriptive name.
5. Write tests FIRST, then implement your change.
6. Run all tests and ensure they pass.
7. Push your branch and open a Pull Request.

## Before You Start

### Pick Something to Work On

- Check the [issues](../../issues) for `good first issue` or `help wanted` labels.
- If you have an idea not covered by an issue, **create one first**. Explain the problem and proposed solution. This saves time for everyone.

### Read the Docs

- **[README.md](./README.md)** — Stack, setup, and commands.
- **[DOCS.md](./DOCS.md)** — Detailed conventions, architecture decisions, and workflow.
- **[AGENTS.md](./AGENTS.md)** — Repository guidelines for AI-assisted development.

## Development Workflow

### 1. TDD Is Mandatory

This project uses Test Driven Development. Always:

1. **Red**: Write a failing test.
2. **Green**: Write the minimum code to make it pass.
3. **Refactor**: Clean up while keeping tests green.

```bash
# Run all tests
php artisan test

# Run a specific test file
php artisan test --filter ProjectTest
```

### 2. Code Conventions

**Backend (Laravel):**
- One controller per resource. Validation first, logic second, Inertia response last.
- Models must include `use HasFactory;`. Relationships before custom methods.
- `$fillable` arrays sorted alphabetically.
- Never modify existing migrations — create new ones.

**Frontend (React + TypeScript):**
- Files: `kebab-case` (`authenticated-layout.tsx`).
- Components: `PascalCase` (`export default function AuthenticatedLayout()`).
- Props: explicit interfaces, NO `any`.
- Keep components under 100 lines. Extract hooks for reusable logic.
- Use Shadcn/ui (`Components/ui/`) for base components.

### 3. Git Conventions

**Branch names:**
- `feat/description` — new features
- `fix/description` — bug fixes
- `refactor/description` — code improvements
- `test/description` — adding or fixing tests

**Branch flow:**
- `feat/*` and `fix/*` branches are created from `development`.
- Normal feature/fix Pull Requests target `development`.
- `master` is the promotion/release branch fed from `development`.

**Commit messages** (conventional commits):
```
feat: add join request system
test: add ProjectController::index tests
fix: validate techs array is non-empty
refactor: extract tech selection hook
```

Each commit should be atomic — one logical change per commit.

## Pull Requests

### Before Submitting

- [ ] All tests pass (`php artisan test`)
- [ ] Code follows project conventions (see [DOCS.md](./DOCS.md))
- [ ] No debug code, `console.log`, or commented-out code
- [ ] Commit messages follow conventional commits format
- [ ] Branch is up to date with `development`

### PR Description

Include:
- **What** changed and **why** (the problem it solves).
- **How** to test it (steps or commands).
- Screenshots for UI changes.
- Link to the related issue (if any).

### Review Process

1. CI must pass (automated tests and linting).
2. At least one maintainer review is required.
3. Address review feedback with new commits — do not force-push unless asked.
4. Once approved, the PR will be merged into `development`.

## Need Help?

- Check [DOCS.md](./DOCS.md) for detailed conventions and troubleshooting.
- Ask in the issue or PR comments — we prefer public discussions so everyone benefits.
