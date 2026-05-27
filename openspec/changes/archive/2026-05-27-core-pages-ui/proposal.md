# Proposal: Core Pages UI Redesign

## Intent

The projects/index page was redesigned with shadcn components (Select, Empty, Pagination, search bar) establishing a new visual standard. The two remaining core pages — user profile (`users/show`) and project detail (`projects/show`) — still use basic stacked Card layouts that feel inconsistent with the rest of the app. This change brings both pages to the same professional quality level.

## Scope

### In Scope
- **User Profile Page** — Hero section with large avatar + name + bio, stats row (projects count, techs count, member since), tech showcase grouped by proficiency, project tabs using shadcn Tabs
- **Project Detail Page** — Hero section with featured image, two-column layout (main content + sidebar), sidebar for metadata (status badge, creator, techs, URLs), improved gallery grid, prominent join request section
- Replace all `space-y-*` with `gap-*` per shadcn composition rules
- Install shadcn Tabs component for user profile project tabs
- Consistent use of shadcn Empty, Separator, Skeleton components

### Out of Scope
- Backend changes (controllers, services, models)
- New features or functionality
- `users/index` page (user directory)
- `projects/create` and `projects/edit` pages
- Loading state implementation (Skeleton infrastructure only)

## Capabilities

### New Capabilities
- None — UI redesign only, no new behavior

### Modified Capabilities
- None — spec-level behavior doesn't change, only visual presentation

## Approach

### User Profile Page (`users/show.tsx`)
- Replace single Card wrapper with editorial hero layout
- Header: large avatar (xl size), name, bio, member-since date
- Stats row: 3 horizontal metric cards (projects created, participating, techs count)
- Tech showcase: group badges by proficiency level (Experto, Avanzado, Intermedio, Principiante) with visual hierarchy
- Project tabs: install shadcn Tabs, replace custom tab buttons
- Empty states: use shadcn Empty component for no projects/techs

### Project Detail Page (`projects/show.tsx`)
- Hero: featured image as full-width banner (or large card if no image)
- Desktop: two-column grid (`lg:grid-cols-3`) — main content (2 cols) + sidebar (1 col)
- Sidebar: status badge, creator link (with avatar), techs list, external URLs (repo, demo)
- Main content: description, vision, gallery grid (improved thumbnails), participants list
- Join request: prominent Card with clear CTA, already uses shadcn form components
- Delete dialog: unchanged (already uses shadcn Dialog correctly)

### New Components
- `npx shadcn@latest add tabs` — for user profile project tabs
- Skeleton already exists at `resources/js/components/ui/skeleton.tsx`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/users/show.tsx` | Modified | Complete layout redesign |
| `resources/js/pages/projects/show.tsx` | Modified | Hero + sidebar layout restructure |
| `resources/js/components/user/user-profile-header.tsx` | Modified | Enhanced visual design |
| `resources/js/components/user/tech-showcase.tsx` | Modified | Grouped by proficiency level |
| `resources/js/components/user/project-showcase.tsx` | Modified | Use shadcn Tabs component |
| `resources/js/components/ui/tabs.tsx` | New | Install shadcn Tabs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Two-column layout breaks on mobile | Low | Mobile-first with `lg:` breakpoint, single column fallback |
| Tabs component API mismatch | Low | Read shadcn docs before implementation, follow existing patterns |
| Over-engineering the design | Medium | Keep it clean and functional, follow existing shadcn patterns from projects/index |

## Rollback Plan

1. Revert the 6 affected files from git — pure UI changes, no data migration
2. Uninstall Tabs component if needed: remove `resources/js/components/ui/tabs.tsx`
3. No database or config changes to undo

## Dependencies

- shadcn Tabs component (needs to be installed via `npx shadcn@latest add tabs`)
- Existing shadcn components already installed: Card, Badge, Avatar, Button, Dialog, Separator, Empty, Skeleton

## Success Criteria

- [ ] User profile page has hero layout with stats row and grouped tech showcase
- [ ] Project detail page has hero/sidebar layout with visual hierarchy
- [ ] Both pages use `gap-*` instead of `space-y-*` (shadcn composition rule)
- [ ] Both pages are responsive (mobile-first, single column on small screens)
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `php artisan test`
- [ ] shadcn Tabs component installed and used in user profile
