# Design: Core Pages UI Redesign

## Technical Approach

Redesign `users/show` and `projects/show` pages to match the visual quality of `projects/index` by upgrading from basic Card stacking to hero layouts, two-column grids, and shadcn Tabs. No backend changes — purely frontend visual restructuring using existing data shapes.

## Architecture Decisions

| Decision | Option | Tradeoff | Decision |
|----------|--------|----------|----------|
| Tab component | shadcn Tabs vs custom buttons (current) | Custom buttons lack keyboard nav, ARIA; shadcn adds 1 dependency | Install shadcn Tabs (`@radix-ui/react-tabs`) |
| Page layout | Single column (current) vs two-column grid | Two-column better uses wide screens, separates primary/secondary content | Two-column `grid-cols-1 lg:grid-cols-3` for project detail; full-width hero + grid for profile |
| Spacing convention | `space-y-*` (current) vs `gap` | `gap` is the project standard, works with grid/flex consistently | Replace all `space-y-*` with `gap` |
| Hero treatment | Inline in page vs extracted component | Extracted components are reusable but add indirection; these are page-specific | Keep inline in page files (under 100 lines each section) |
| Stats row | New StatsCard component vs inline flex | Inline is simpler, stats are page-specific | Inline `flex gap-4` with `cn()` helper for stat items |

## Data Flow

No data flow changes. Existing controller responses feed the same props. Layout restructuring only:

```
Controller ──→ Page Props (unchanged)
                   │
                   ├── Hero Section (rearranged visually)
                   ├── Stats Row (computed from existing arrays)
                   └── Content Grid (reorganized, same data)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/ui/tabs.tsx` | Create | Install shadcn Tabs component (`@radix-ui/react-tabs`) |
| `resources/js/pages/users/show.tsx` | Modify | Hero layout with gradient bg, stats row (created/participating/techs count), `gap` spacing, wider container (`max-w-5xl`) |
| `resources/js/pages/projects/show.tsx` | Modify | Hero with main image as full-width banner, two-column `grid-cols-1 lg:grid-cols-3` (main 2fr, sidebar 1fr), `gap` spacing |
| `resources/js/components/user/user-profile-header.tsx` | Modify | Larger avatar (`size="lg"` → explicit `size-20`), display name with `font-display`, bio with `line-clamp-3`, member date as muted caption |
| `resources/js/components/user/tech-showcase.tsx` | Modify | Group techs by proficiency level (Experto, Avanzado, Intermedio, Principiante) as labeled sections instead of flat list |
| `resources/js/components/user/project-showcase.tsx` | Modify | Replace custom tab buttons with shadcn `Tabs` + `TabsList` + `TabsContent`, use `gap` not `space-y` |

## Interfaces / Contracts

No new interfaces. Existing types from `@/types` cover all data:

- `UserProfile` — unchanged, provides `createdProjects`, `participatingProjects`, `techs`
- `Project & { creator, techs, participants }` — unchanged
- `UserProject` — used in project lists
- `UserTech` — used in tech showcase with `years` for proficiency grouping

Stats computed in-page (no type changes):
```ts
const stats = [
  { label: 'Proyectos creados', value: user.createdProjects.length },
  { label: 'Proyectos participando', value: user.participatingProjects.length },
  { label: 'Tecnologías', value: user.techs.length },
];
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Visual | Hero renders with correct layout | Manual review + Playwright snapshot if available |
| Component | Tabs switch correctly between created/participating | Render component, click tabs, verify content changes |
| Responsive | Two-column collapses to single on mobile | Browser resize test |
| Accessibility | Tabs have proper ARIA roles, keyboard navigation | Tab key navigation, screen reader test |
| Edge cases | Empty techs, empty projects, no images | Verify graceful empty states |

## Migration / Rollout

No migration required. Pure frontend change, no database or API modifications. Feature is visible immediately on deploy.

## Open Questions

- [ ] Should the hero image on project detail use a gradient overlay with title text, or keep image separate from title? (Recommendation: overlay for visual impact, fallback to separate if image missing)
- [ ] Should stats on user profile show icons (lucide-react) or just numbers? (Recommendation: icons for scanability)
