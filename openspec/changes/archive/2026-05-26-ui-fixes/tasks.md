# Tasks: UI Fixes — Dropdown Styling & Component Consistency

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 20-40 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Fix dropdown styling + refactor nav components + audit | PR 1 | Single PR — all frontend UI fixes, no backend |

## Phase 1: Component Fixes

- [x] 1.1 Add `bg-card shadow-md rounded-lg border border-border min-w-[8rem] p-1` to `Dropdown.Content` className in `resources/js/components/ui/dropdown.tsx` line 21
- [x] 1.2 Refactor `resources/js/components/nav-link.tsx` — replace string concatenation with `cn()` utility, add `import { cn } from '@/lib/utils'`
- [x] 1.3 Refactor `resources/js/components/responsive-nav-link.tsx` — replace template literal with `cn()` utility, add `import { cn } from '@/lib/utils'`

## Phase 2: Audit & Cleanup

- [x] 2.1 Fix `text-gray-600` → `text-muted-foreground` in `resources/js/pages/profile/partials/update-password-form.tsx` line 134
- [x] 2.2 Note: `welcome.tsx` Breeze-style classes are marketing page — out of scope, defer to future work

## Phase 3: Verification

- [x] 3.1 Run `npm run build` — confirm no TypeScript or build errors
- [x] 3.2 Run `php artisan test` — confirm all existing tests pass
- [x] 3.3 Visually verify dropdown has visible background, shadow, and border in light and dark mode
