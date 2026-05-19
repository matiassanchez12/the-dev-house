# Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms. Dev collab is a monorepo with several components.
- Component docs override this file when guidance conflicts.

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (Any Project)
| Skill | Description | URL |
|-------|-------------|-----|
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `react-19` | No useMemo/useCallback, React Compiler | [SKILL.md](skills/react-19/SKILL.md) |
| `nextjs-16` | App Router, Server Actions, proxy.ts, streaming | [SKILL.md](skills/nextjs-16/SKILL.md) |
| `tailwind-4` | cn() utility, no var() in className | [SKILL.md](skills/tailwind-4/SKILL.md) |
| `playwright` | Page Object Model, MCP workflow, selectors | [SKILL.md](skills/playwright/SKILL.md) |
| `pytest` | Fixtures, mocking, markers, parametrize | [SKILL.md](skills/pytest/SKILL.md) |
| `django-drf` | ViewSets, Serializers, Filters | [SKILL.md](skills/django-drf/SKILL.md) |
| `jsonapi` | Strict JSON:API v1.1 spec compliance | [SKILL.md](skills/jsonapi/SKILL.md) |
| `zod-4` | New API (z.email(), z.uuid()) | [SKILL.md](skills/zod-4/SKILL.md) |
| `zustand-5` | Persist, selectors, slices | [SKILL.md](skills/zustand-5/SKILL.md) |
| `ai-sdk-5` | UIMessage, streaming, LangChain | [SKILL.md](skills/ai-sdk-5/SKILL.md) |
| `vitest` | Unit testing, React Testing Library | [SKILL.md](skills/vitest/SKILL.md) |
| `tdd` | Test-Driven Development workflow | [SKILL.md](skills/tdd/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Add changelog entry for a PR or feature | `prowler-changelog` |
| Adding DRF pagination or permissions | `django-drf` |
| Adding a compliance output formatter (per-provider class + table dispatcher) | `prowler-compliance` |
| Adding indexes or constraints to database tables | `django-migration-psql` |
| Adding new providers | `prowler-provider` |
| Adding privilege escalation detection queries | `prowler-attack-paths-query` |
| Adding services to existing providers | `prowler-provider` |
| After creating/modifying a skill | `skill-sync` |
| App Router / Server Actions | `nextjs-16` |
| Auditing check-to-requirement mappings as a cloud auditor | `prowler-compliance` |
| Building AI chat features | `ai-sdk-5` |
| Committing changes | `prowler-commit` |
| Configuring MCP servers in agentic workflows | `gh-aw` |
| Create PR that requires changelog entry | `prowler-changelog` |
| Create a PR with gh pr create | `prowler-pr` |
| Creating API endpoints | `jsonapi` |
| Creating Attack Paths queries | `prowler-attack-paths-query` |
| Creating GitHub Agentic Workflows | `gh-aw` |
| Creating ViewSets, serializers, or filters in api/ | `django-drf` |
| Creating Zod schemas | `zod-4` |
| Creating a git commit | `prowler-commit` |
| Creating new checks | `prowler-sdk-check` |
| Creating new skills | `skill-creator` |
| Creating or reviewing Django migrations | `django-migration-psql` |
| Creating/modifying Prowler UI components | `prowler-ui` |
| Creating/modifying models, views, serializers | `prowler-api` |
| Creating/updating compliance frameworks | `prowler-compliance` |
| Debug why a GitHub Actions job is failing | `prowler-ci` |
| Debugging gh-aw compilation errors | `gh-aw` |
| Fill .github/pull_request_template.md (Context/Description/Steps to review/Checklist) | `prowler-pr` |
| Fixing bug | `tdd` |
| Fixing compliance JSON bugs (duplicate IDs, empty Section, stale refs) | `prowler-compliance` |
| General Prowler development questions | `prowler` |
| Implementing JSON:API endpoints | `django-drf` |
| Implementing feature | `tdd` |
| Importing Copilot Custom Agents into workflows | `gh-aw` |
| Inspect PR CI checks and gates (.github/workflows/*) | `prowler-ci` |
| Inspect PR CI workflows (.github/workflows/*): conventional-commit, pr-check-changelog, pr-conflict-checker, labeler | `prowler-pr` |
| Mapping checks to compliance controls | `prowler-compliance` |
| Mocking AWS with moto in tests | `prowler-test-sdk` |
| Modifying API responses | `jsonapi` |
| Modifying component | `tdd` |
| Modifying gh-aw workflow frontmatter or safe-outputs | `gh-aw` |
| Refactoring code | `tdd` |
| Regenerate AGENTS.md Auto-invoke tables (sync.sh) | `skill-sync` |
| Review PR requirements: template, title conventions, changelog gate | `prowler-pr` |
| Review changelog format and conventions | `prowler-changelog` |
| Reviewing JSON:API compliance | `jsonapi` |
| Reviewing compliance framework PRs | `prowler-compliance-review` |
| Running makemigrations or pgmakemigrations | `django-migration-psql` |
| Syncing compliance framework with upstream catalog | `prowler-compliance` |
| Testing RLS tenant isolation | `prowler-test-api` |
| Testing hooks or utilities | `vitest` |
| Troubleshoot why a skill is missing from AGENTS.md auto-invoke | `skill-sync` |
| Understand CODEOWNERS/labeler-based automation | `prowler-ci` |
| Understand PR title conventional-commit validation | `prowler-ci` |
| Understand changelog gate and no-changelog label behavior | `prowler-ci` |
| Understand review ownership with CODEOWNERS | `prowler-pr` |
| Update CHANGELOG.md in any component | `prowler-changelog` |
| Updating README.md provider statistics table | `prowler-readme-table` |
| Updating checks, services, compliance, or categories count in README.md | `prowler-readme-table` |
| Updating existing Attack Paths queries | `prowler-attack-paths-query` |
| Updating existing checks and metadata | `prowler-sdk-check` |
| Using Zustand stores | `zustand-5` |
| Working on MCP server tools | `prowler-mcp` |
| Working on Prowler UI structure (actions/adapters/types/hooks) | `prowler-ui` |
| Working on task | `tdd` |
| Working with Prowler UI test helpers/pages | `prowler-test-ui` |
| Working with Tailwind classes | `tailwind-4` |
| Writing Playwright E2E tests | `playwright` |
| Writing Prowler API tests | `prowler-test-api` |
| Writing Prowler SDK tests | `prowler-test-sdk` |
| Writing Prowler UI E2E tests | `prowler-test-ui` |
| Writing Python tests with pytest | `pytest` |
| Writing React component tests | `vitest` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |
| Writing Vitest tests | `vitest` |
| Writing data backfill or data migration | `django-migration-psql` |
| Writing documentation | `prowler-docs` |
| Writing unit tests for UI | `vitest` |