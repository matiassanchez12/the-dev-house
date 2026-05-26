# Skill Registry — dev-collab-platform
Generated: 2026-05-25 (rebuilt from stack detection)
Source: .agents/skills/ (project-level), AGENTS.md conventions

## Auto-invoke Skills (Must load before action)

| Action | Skill | Path | Key Rules |
|--------|-------|------|-----------|
| TDD workflow | `tdd` | skills/tdd/SKILL.md | Red→Green→Refactor, test-first |
| Fixing bug | `tdd` | skills/tdd/SKILL.md | Test-first bug fixing |
| Implementing feature | `tdd` | skills/tdd/SKILL.md | Test-first implementation |
| Running tests | `tdd` | skills/tdd/SKILL.md | Test execution workflow |
| React components | `react-19` | skills/react-19/SKILL.md | React 18 patterns, no useMemo/useCallback |
| TypeScript types | `typescript` | skills/typescript/SKILL.md | Strict types, flat interfaces |
| Tailwind classes | `tailwind-4` | skills/tailwind-4/SKILL.md | cn() utility, no var() in className |
| React tests | `vitest` | skills/vitest/SKILL.md | React Testing Library |
| Vitest tests | `vitest` | skills/vitest/SKILL.md | Unit testing |
| Zod schemas | `zod-4` | skills/zod-4/SKILL.md | New Zod API |
| Committing | `prowler-commit` | skills/prowler-commit/SKILL.md | Conventional commits |
| Creating new skills | `skill-creator` | skills/skill-creator/SKILL.md | LLM-first skills with frontmatter |

## Project-Level Skills (.agents/skills/)

| Skill | Description | Compact Rules |
|-------|-------------|---------------|
| `laravel-patterns` | Laravel architecture patterns, routing/controllers, Eloquent ORM, service layers, queues, events, caching | - Controllers → Services → Actions<br>- Route-model binding + scoped bindings<br>- Typed models, casts, scopes<br>- Keep IO in queues, cache reads<br>- Eager load to avoid N+1 |
| `laravel-specialist` | Laravel 10+ specialist: Eloquent, Sanctum, Horizon, Livewire, Inertia | - PHP 8.2+ features (readonly, enums)<br>- >85% test coverage target<br>- Service containers + DI<br>- PSR-12 coding standard |
| `shadcn` | shadcn/ui components management | - Use existing components via CLI<br>- Compose, don't reinvent<br>- Semantic colors: `bg-primary`, `text-muted-foreground`<br>- No `space-x-*`, use `gap-*`<br>- Forms: `FieldGroup` + `Field` |
| `vite` | Vite build tool, plugin API, SSR, Vite 8 Rolldown migration | - Use TypeScript: prefer vite.config.ts<br>- Always ESM, avoid CommonJS<br>- Environment API for multi-env |
| `tailwind-css-patterns` | Tailwind utility-first styling, responsive design, layout | - Mobile-first breakpoints<br>- Use design tokens<br>- Extract reusable component classes<br>- Configure content paths |
| `tailwind-v4-shadcn` | Tailwind v4 + shadcn/ui + Vite integration, dark mode | - `@theme inline` pattern (v4)<br>- CSS variable architecture<br>- Dark mode with `ThemeProvider`<br>- Four-step architecture |
| `typescript-advanced-types` | Generics, conditional types, mapped types, template literals | - Use `unknown` over `any`<br>- Prefer `interface` for object shapes<br>- Leverage type inference<br>- Use const assertions |
| `vercel-react-best-practices` | React/Next.js performance from Vercel Engineering | - CRITICAL: Eliminate waterfalls (Promise.all)<br>- Bundle optimization (avoid barrel imports)<br>- Server-side performance (parallel fetching)<br>- React 18: no useMemo/useCallback needed |
| `composition-patterns` | React compound components, render props, context | - Avoid boolean prop proliferation<br>- Use compound components over conditionals<br>- State: decouple implementation from interface |
| `php-pro` | Modern PHP 8.3+, Laravel/Symfony, strict typing, PHPStan | - `declare(strict_types=1)` everywhere<br>- PHPStan level 9<br>- PSR-12 coding standard<br>- Use readonly properties |
| `seo` | Meta tags, structured data, performance | - Follow WCAG 2.2<br>- Semantic HTML<br>- Performance optimization |
| `accessibility` | WCAG 2.2 guidelines, ARIA, screen readers | - Audit with a11y patterns<br>- Keyboard navigation support |
| `frontend-design` | Design systems, component architecture | - Production-grade interfaces<br>- High design quality |
| `nodejs-backend-patterns` | Express/Fastify middleware, error handling, auth | - Production-ready backend patterns |
| `nodejs-best-practices` | Node.js development principles, async patterns, security | - Framework selection guidance<br>- Async patterns<br>- Security best practices |

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
- UI: Shadcn/ui + Tailwind CSS + CVA
- State: React hooks + Inertia `useForm`

### Testing (Strict TDD — Mandatory)
- Write tests FIRST: Red → Green → Refactor
- Feature tests in `tests/Feature/`
- Unit tests in `tests/Unit/`
- Arrange → Act → Assert structure
- `use RefreshDatabase;` on every Feature test
- Minimum 80% coverage on critical features

### Skill Origin Priority
1. Project-level (`.agents/skills/`) — preferred
2. User-level (`~/.config/opencode/skills/`)
3. System reference only (not directly invokable)
