# Design: Project Card Redesign & Show Page Decomposition

## Technical Approach

Extract duplicated `statusConfig` and `getInitials()` into a shared `project-utils.ts` module, create a reusable `ProjectStatusBadge` component, decompose `show.tsx` (361 lines) into 11 focused section components under `components/projects/show/`, and redesign `ProjectCard` with image thumbnail, meta row, and enhanced featured variant. All changes are frontend-only — no backend, API, or database modifications.

Maps to proposal phases: (1) utils extraction → (2) status badge → (3) show decomposition → (4) card redesign.

## Architecture Decisions

| Decision | Option A | Option B | Decision | Rationale |
|----------|----------|----------|----------|-----------|
| `statusConfig` location | Keep inline in each file | Extract to `project-utils.ts` | **B** | DRY, single source of truth, spec requires it |
| `getInitials` location | Keep inline in each file | Extract to `project-utils.ts` | **B** | Same as above; identical logic in both files |
| Show section props | Pass full `project` object | Flat props per component | **B** | Follows existing convention; spec requires flat props; reduces coupling |
| `ProjectJoinForm` scope | Single component for auth + unauth | Two separate components | **A** | Conditional rendering based on `auth.user` is simpler; same card wrapper |
| Relative date | Server-side formatted string | Client-side `formatDistanceToNow` | **A** | No new dependency; controller already provides `created_at`; simple helper in utils |
| Featured variant | `ring-2 ring-primary/20 shadow-xl` | `border-2 border-primary/20 shadow-xl` | **A** | `ring` is Tailwind's standard for focus/accent borders; consistent with shadcn patterns |
| Image URL handling | Prepend `/storage/` in each component | Helper function in utils | **A** | Only 2 components need this (hero, card); helper adds indirection for minimal gain |

## Data Flow

```
show.tsx (page component)
  ├── receives: { auth, project } from Inertia
  ├── derives: isCreator, status, creatorInitials
  │
  ├──→ ProjectHero        (title, status, images[0])
  ├──→ ProjectDescription (description)
  ├──→ ProjectVision      (vision)
  ├──→ ProjectGallery     (images.slice(1))
  ├──→ ProjectParticipants(participants)
  ├──→ ProjectCreatorCard (creator)
  ├──→ ProjectTechsCard   (techs)
  ├──→ ProjectLinksCard   (repository_url, demo_url)
  ├──→ ProjectJoinForm    (projectId, isCreator, status, auth.user)
  └──→ ProjectDeleteDialog(open, onClose, onDelete)

project-card.tsx (list item)
  ├── receives: { project, variant, showParticipatingCount }
  ├── imports: statusConfig, getInitials from project-utils
  ├──→ ProjectStatusBadge (status)
  └── renders: thumbnail | gradient, meta row, techs
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/components/projects/project-utils.ts` | **Create** | `statusConfig` record, `getInitials()`, `storageUrl()` helper |
| `resources/js/components/projects/project-status-badge.tsx` | **Create** | Reusable badge: receives `status`, renders Badge + icon from config |
| `resources/js/components/projects/show/project-hero.tsx` | **Create** | Hero banner: image or gradient fallback + title + status badge |
| `resources/js/components/projects/show/project-description.tsx` | **Create** | Description card with `whitespace-pre-line` |
| `resources/js/components/projects/show/project-vision.tsx` | **Create** | Vision card (parent handles conditional render) |
| `resources/js/components/projects/show/project-gallery.tsx` | **Create** | Image grid from `images.slice(1)` |
| `resources/js/components/projects/show/project-participants.tsx` | **Create** | Participants list as outline badges |
| `resources/js/components/projects/show/project-creator-card.tsx` | **Create** | Creator avatar + name + profile link card |
| `resources/js/components/projects/show/project-techs-card.tsx` | **Create** | Tech badges list card |
| `resources/js/components/projects/show/project-links-card.tsx` | **Create** | Repository + demo external links card |
| `resources/js/components/projects/show/project-join-form.tsx` | **Create** | Join request form (auth) or login/register CTA (unauth) |
| `resources/js/components/projects/show/project-delete-dialog.tsx` | **Create** | Delete confirmation Dialog |
| `resources/js/components/projects/project-card.tsx` | **Modify** | Remove inline `statusConfig`/`getInitials`, add thumbnail, meta row, featured ring |
| `resources/js/pages/projects/show.tsx` | **Modify** | Reduce to ~80 lines: imports + derives props + composes 11 section components |

## Interfaces / Contracts

### `project-utils.ts`

```ts
import { CircleDot, CheckCircle, CircleX, type LucideIcon } from 'lucide-react';

export type ProjectStatus = 'open' | 'completed' | 'closed';

export interface StatusConfigEntry {
    label: string;
    icon: LucideIcon;
    className: string;
}

export const statusConfig: Record<ProjectStatus, StatusConfigEntry> = {
    open: { label: 'Abierto', icon: CircleDot, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    completed: { label: 'Completado', icon: CheckCircle, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    closed: { label: 'Cerrado', icon: CircleX, className: 'bg-muted text-foreground' },
};

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function storageUrl(path: string): string {
    return `/storage/${path}`;
}
```

### `ProjectStatusBadge` Props

```ts
interface ProjectStatusBadgeProps {
    status: ProjectStatus | string;
    className?: string;
}
```

### Show Section Component Props (flat, per component)

```ts
// project-hero.tsx
interface ProjectHeroProps {
    title: string;
    status: ProjectStatus | string;
    image?: string | null;
}

// project-description.tsx
interface ProjectDescriptionProps {
    description: string;
}

// project-vision.tsx
interface ProjectVisionProps {
    vision: string;
}

// project-gallery.tsx
interface ProjectGalleryProps {
    images: string[];
}

// project-participants.tsx
interface ProjectParticipantsProps {
    participants: { id: number; name: string }[];
}

// project-creator-card.tsx
interface ProjectCreatorCardProps {
    creator: { id: number; name: string; slug: string; avatar?: string | null };
}

// project-techs-card.tsx
interface ProjectTechsCardProps {
    techs: { id: number; name: string }[];
}

// project-links-card.tsx
interface ProjectLinksCardProps {
    repositoryUrl?: string | null;
    demoUrl?: string | null;
}

// project-join-form.tsx
interface ProjectJoinFormProps {
    projectId: number;
    isCreator: boolean;
    projectStatus: string;
    currentUser: { id: number; name: string; email: string } | null;
}

// project-delete-dialog.tsx
interface ProjectDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
    processing: boolean;
}
```

### Refactored `show.tsx` Structure (~80 lines)

```tsx
// Imports: Inertia, layout, 11 section components, types, hooks
// Props interface (unchanged)
// Derivations: isCreator, handleDelete, handleJoinRequest, deleteForm, joinForm
// Return: Head + AppLayout with header → Hero → 2-col grid → DeleteDialog
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getInitials()` edge cases (single name, empty, special chars) | Pure function tests in `project-utils.test.ts` |
| Unit | `statusConfig` completeness (all 3 statuses have label/icon/className) | Simple assertion tests |
| Unit | `ProjectStatusBadge` renders correct config for each status | Vitest + React Testing Library |
| Unit | Each show section component renders with valid props | Vitest + RTL, snapshot or assertion |
| Integration | `show.tsx` composes all 11 components with correct props | Vitest + RTL, render full page mock |
| Integration | `ProjectCard` thumbnail shows/hides based on images + variant | Vitest + RTL |

No E2E tests — visual changes verified manually; no behavioral changes to test end-to-end.

## Migration / Rollout

No migration required. Pure frontend refactor with no backend, database, or API changes. Single PR (or chained PRs if >400 lines) can be reverted cleanly via git.

## Open Questions

- [ ] Should `in_progress` status be added to `statusConfig`? Current `Project.status` type is `'open' | 'closed' | 'completed'` — no `in_progress` in the type. Spec mentions it but types don't support it yet. **Decision**: exclude from this change; add when backend supports it.
- [ ] Should `ProjectCard` receive a `createdAt` prop for relative date display? The `UserProject` type doesn't include `created_at`. **Decision**: pass `created_at` from `Project` type only; `UserProject` cards skip relative date (not in scope for this change).
