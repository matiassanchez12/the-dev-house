# Design: theme-contrast

## Technical Approach

Pure token-mapping operation: replace hardcoded Tailwind gray utilities with semantic CSS variables already defined in `resources/css/app.css`. No component logic changes, no structural changes, no new tests required beyond regression testing.

## Architecture Decisions

### Decision: Semantic Token Selection

**Choice**: Use `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-card`, `bg-primary`, `border-primary`, `border-border`

**Alternatives considered**: Creating new custom tokens (rejected — extra CSS and maintenance)

**Rationale**: Tokens already exist in the design system with proper light/dark HSL values in `app.css`

### Decision: Dark Mode Overlay for Modal

**Choice**: `bg-black/50` for modal overlay

**Alternatives considered**: `bg-background/75` with opacity (rejected — semantic overlay should be neutral dark regardless of theme)

**Rationale**: Modal overlay should always feel like a dark scrim; `bg-black/50` is neutral and provides consistent contrast

### Decision: Tech Badge Proficiency Colors

**Choice**: Keep proficiency-specific colors (purple/green/blue) for `proficiencyConfig`, only map the base badge classes

**Alternatives considered**: Full semantic mapping of all badge colors (rejected — proficiency colors are semantic in context: expert=purple, advanced=green, etc.)

**Rationale**: Proficiency labels have established color semantics; only base `bg-gray-100` / `dark:bg-gray-900/30` needs mapping

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/nav-link.tsx` | Modify | Replace `text-gray-900`, `border-indigo-400`, `text-gray-500`, `hover:text-gray-700`, `hover:border-gray-300` |
| `resources/js/components/responsive-nav-link.tsx` | Modify | Replace `text-gray-600`, `hover:border-gray-300`, `bg-indigo-50` |
| `resources/js/components/modal.tsx` | Modify | Replace `bg-gray-500/75` overlay, `bg-white` card |
| `resources/js/components/dropdown.tsx` | Modify | Replace `text-gray-700`, `hover:bg-gray-100` in DropdownLink |
| `resources/js/components/user/tech-showcase.tsx` | Modify | Replace `bg-gray-100`, `text-gray-800`, `dark:bg-gray-900/30`, `dark:text-gray-400` |
| `resources/js/pages/auth/forgot-password.tsx` | Modify | Replace `text-gray-600`, add `dark:text-green-400` to success |
| `resources/js/pages/auth/confirm-password.tsx` | Modify | Replace `text-gray-600` |
| `resources/js/pages/auth/verify-email.tsx` | Modify | Replace `text-gray-600`, add `dark:text-green-400` to success |
| `resources/js/pages/welcome.tsx` | Modify | Replace `bg-gray-50`, `text-black/50` |

## Token Mapping Reference

| Original Class | Semantic Replacement | Notes |
|----------------|---------------------|-------|
| `text-gray-900` | `text-foreground` | Active nav link text |
| `text-gray-500` | `text-muted-foreground` | Inactive nav link text |
| `text-gray-600` | `text-muted-foreground` | Auth page secondary text |
| `text-gray-700` | `text-foreground` | Dropdown item text |
| `text-gray-800` | `text-foreground` | Tech badge text |
| `text-black/50` | `text-muted-foreground` | Welcome page muted text |
| `border-indigo-400` | `border-primary` | Active nav border |
| `border-gray-300` | `border-border` | Inactive hover border |
| `hover:border-gray-300` | `hover:border-border` | Inactive hover border |
| `hover:text-gray-700` | `hover:text-foreground` | Inactive nav hover |
| `hover:text-gray-800` | `hover:text-foreground` | Responsive nav hover |
| `bg-indigo-50` | `bg-primary/10` | Active responsive nav bg |
| `bg-gray-50` | `bg-muted` | Responsive nav hover bg |
| `bg-gray-100` | `bg-muted` | Dropdown hover, tech badge bg |
| `bg-gray-500/75` | `bg-black/50` | Modal overlay |
| `bg-white` | `bg-card` | Modal card |
| `bg-gray-900/30` | `dark:bg-muted` | Dark tech badge bg |
| `dark:text-gray-400` | `dark:text-muted-foreground` | Dark tech badge text |
| `text-green-600` | `text-green-600 dark:text-green-400` | Auth success messages |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Regression | No visual test breaks | Run full `php artisan test` after each batch |

**Batch execution order:**
1. `nav-link` + `responsive-nav-link` → `DashboardTest`
2. `modal` + `dropdown` → `ProfileTest`
3. `tech-showcase` → `UserProfileTest`
4. Auth pages → `AuthTest`
5. `welcome.tsx` → Full suite

## Implementation Notes

- TechShowcase `proficiencyConfig` array uses direct class strings — only the base `bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400` in the Principiante entry needs mapping; other entries use colored variants that are intentionally semantic
- Welcome.tsx line 18 uses `text-black/50` which maps to `text-muted-foreground` (mapped in dark mode via `dark:text-white/50`)
- No TypeScript type changes needed — className only
- No new components or interfaces introduced
