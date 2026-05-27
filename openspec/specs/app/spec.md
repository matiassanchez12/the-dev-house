# App Architecture Specification

## Overview

This spec documents the architecture of the DevCollab platform — a Laravel + React + Inertia.js monolith.

## Architecture

The application follows a Service Layer architecture:

```
app/
├── Http/Controllers/     # THIN — routing, validation via FormRequest, Inertia response
├── Http/Requests/        # FormRequest classes per action (validation >10 rules)
├── Services/             # Business logic — one service per aggregate
├── Policies/             # Authorization via Laravel Gate/Policy system
└── Models/               # Eloquent only — no business logic
```

## Service Layer

### ProjectService (`app/Services/ProjectService.php`)

Encapsulates all project-related business logic.

**Methods**:
- `generateUniqueSlug(string $title, ?int $excludeId = null): string` — URL-safe slug with collision detection
- `create(User $user, array $data): Project` — creates project with slug + tech associations
- `update(Project $project, array $data): Project` — updates with tech sync + slug refresh + image removal
- `uploadImages(array $files): array` — stores in `storage/app/projects/`
- `deleteImages(array $paths): void` — removes from storage
- `delete(Project $project): void` — deletes project

### JoinRequestService (`app/Services/JoinRequestService.php`)

Handles join request lifecycle.

**Methods**:
- `validateCanCreate(Project $project, User $user): void` — throws `DuplicateJoinRequestException` or `SelfJoinException`
- `create(Project $project, User $user, string $message): JoinRequest` — creates pending request
- `approve(JoinRequest $joinRequest): void` — approves + attaches participant
- `reject(JoinRequest $joinRequest): void` — sets status to rejected
- `cancel(JoinRequest $joinRequest): void` — deletes request

### DashboardService (`app/Services/DashboardService.php`)

Consolidates dashboard data.

**Methods**:
- `getDashboardData(User $user): array` — returns `['stats', 'createdProjects', 'participatingProjects', 'pendingRequests', 'sentRequests']`

### ProfileService (`app/Services/ProfileService.php`)

Handles profile operations.

**Methods**:
- `updateAvatar(User $user, UploadedFile $file): string` — replaces avatar
- `deleteAvatar(User $user): void` — removes avatar file + clears path
- `syncTechs(User $user, array $techs): void` — syncs with proficiency pivot data
- `deleteAccount(User $user): void` — deletes user + avatar + cascade JoinRequests

## Policies

### ProjectPolicy (`app/Policies/ProjectPolicy.php`)

Owner-only authorization.

- `update(Project $project, User $user): bool`
- `delete(Project $project, User $user): bool`
- `manage(Project $project, User $user): bool` — alias for update

### JoinRequestPolicy (`app/Policies/JoinRequestPolicy.php`)

Role-based authorization.

- `approve(JoinRequest $joinRequest, User $user): bool` — owner only
- `reject(JoinRequest $joinRequest, User $user): bool` — owner only
- `cancel(JoinRequest $joinRequest, User $user): bool` — applicant only

## FormRequests

| Class | File |
|-------|------|
| `StoreProjectRequest` | `app/Http/Requests/Project/StoreProjectRequest.php` |
| `UpdateProjectRequest` | `app/Http/Requests/Project/UpdateProjectRequest.php` |
| `StoreJoinRequestRequest` | `app/Http/Requests/JoinRequest/StoreJoinRequestRequest.php` |
| `UpdateCompleteProfileRequest` | `app/Http/Requests/Profile/UpdateCompleteProfileRequest.php` |

## Custom Exceptions

| Exception | Location |
|-----------|----------|
| `DuplicateJoinRequestException` | `app/Services/Exceptions/DuplicateJoinRequestException.php` |
| `SelfJoinException` | `app/Services/Exceptions/SelfJoinException.php` |

## Status Flows

**Project status**: `draft` → `open` → `in_progress` → `completed`

**JoinRequest status**: `pending` → `approved | rejected`

## Requirements

### ProjectService Requirements

- `generateUniqueSlug` MUST create URL-safe slug from title
- If slug collision exists, append `-2`, `-3`, etc.
- `excludeId` parameter MUST skip own slug during updates
- `create` MUST attach techs and set `creator_id`
- `update` MUST sync techs, refresh slug on title change, process `remove_images[]`
- `uploadImages` MUST store files in `storage/app/projects/`
- `deleteImages` MUST not throw on missing files

### JoinRequestService Requirements

- `validateCanCreate` MUST throw on duplicate pending request
- `validateCanCreate` MUST throw on self-join attempt
- `approve` MUST attach user as participant
- `reject` MUST NOT modify project relationships
- `cancel` MUST only be callable by request owner

### DashboardService Requirements

- `getDashboardData` MUST return all 5 keys: `stats`, `createdProjects`, `participatingProjects`, `pendingRequests`, `sentRequests`

### ProfileService Requirements

- `updateAvatar` MUST delete existing avatar first
- `deleteAvatar` MUST clear `avatar_path` in DB
- `syncTechs` MUST sync with proficiency pivot data
- `deleteAccount` MUST cascade delete applicant's JoinRequests

### Policy Requirements

- `ProjectPolicy` MUST allow only owner for update/delete/manage
- `JoinRequestPolicy` MUST allow owner for approve/reject, applicant for cancel

### FormRequest Requirements

- `StoreProjectRequest`: title (required, unique, max 255), description (required, max 1000), techs (array, min 1), images (max 5, each 2MB)
- `UpdateProjectRequest`: Same + `remove_images[]` (array of existing paths)
- `StoreJoinRequestRequest`: message (required, min 10, max 500)
- `UpdateCompleteProfileRequest`: bio (optional, max 1000), avatar (image, max 2MB, jpg/png/webp), techs (array of `{id, proficiency}`)

### UI Component Requirements

The system SHALL provide UI components following shadcn/ui patterns. ProjectCard SHALL support `default`, `featured`, and `compact` variants. The `featured` variant SHALL have enhanced visual prominence with gradient border accent and larger shadow. The `closed` status SHALL have visible styling (`bg-muted text-foreground`).

#### Scenario: featured variant has gradient border
- GIVEN `variant="featured"` → `ring-2 ring-primary/20` AND `shadow-xl`

#### Scenario: closed status is visible
- GIVEN `status === 'closed'` → badge has `bg-muted text-foreground` classes

#### Scenario: show.tsx is decomposed
- GIVEN refactored show page → `show.tsx` under 100 lines, composes all 11 section components

### Requirement: Shared Project Utilities

The system SHALL export from `components/projects/project-utils.ts`:
- `statusConfig` — record mapping `open`|`completed`|`closed` to `{ label, icon, className }`
- `getInitials(name: string): string` — up to 2 uppercase initials

All consumers SHALL import from this module, not define inline duplicates.

#### Scenario: closed status has visible styling
- GIVEN `statusConfig.closed` is accessed
- THEN it returns `{ label: 'Cerrado', icon: CircleX, className: 'bg-muted text-foreground' }`

#### Scenario: getInitials extracts initials
- GIVEN `"Juan Pablo Pérez"` → `"JP"`; `"Madonna"` → `"M"`

### Requirement: ProjectStatusBadge Component

The system SHALL provide `components/projects/project-status-badge.tsx` accepting a `status` prop, rendering a `Badge` with icon + label + className from `statusConfig`. Falls back to `closed` config for unknown status.

#### Scenario: renders correct status
- GIVEN `status="open"` → green badge with `CircleDot` icon and `"Abierto"`

### Requirement: Show Page Section Components

The system SHALL provide 11 components under `components/projects/show/`:

| Component | File | Responsibility |
|-----------|------|---------------|
| ProjectHero | `project-hero.tsx` | Banner image or gradient fallback + title + status |
| ProjectDescription | `project-description.tsx` | Description card |
| ProjectVision | `project-vision.tsx` | Vision card (conditional on truthy `vision`) |
| ProjectGallery | `project-gallery.tsx` | Image grid from `images.slice(1)` (conditional if >1) |
| ProjectParticipants | `project-participants.tsx` | Participants as badges (conditional if >0) |
| ProjectCreatorCard | `project-creator-card.tsx` | Creator avatar + name + profile link |
| ProjectTechsCard | `project-techs-card.tsx` | Tech badges list |
| ProjectLinksCard | `project-links-card.tsx` | Repository + demo external links |
| ProjectJoinForm | `project-join-form.tsx` | Join form (auth) or auth CTA (unauth) |
| ProjectDeleteDialog | `project-delete-dialog.tsx` | Delete confirmation Dialog |

Each component SHALL accept flat props with only needed data. No component SHALL receive the full `project` object unless it consumes >3 fields.

#### Scenario: hero shows image or fallback
- GIVEN images exist → 16:9 banner with gradient overlay + title + status
- GIVEN no images → gradient background card with title + status

#### Scenario: delete dialog triggers deletion
- GIVEN dialog open, user clicks Delete → `onDelete` invoked, dialog closes

### Requirement: ProjectCard Image Thumbnail

The system SHALL display `project.images[0]` as a 16:9 top banner in `default` and `featured` variants. Gradient placeholder when no image. `compact` variant SHALL NOT show an image.

#### Scenario: card shows thumbnail
- GIVEN images exist, `variant="default"` → 16:9 banner at card top
- GIVEN no images, `variant="featured"` → gradient placeholder
- GIVEN `variant="compact"` → no image area

### Requirement: ProjectCard Meta Row

The system SHALL render a footer meta row with: status badge, participants count (if >0), and relative date (e.g., "hace 3 días"). Replaces current footer showing only status badge.

#### Scenario: meta row shows all elements
- GIVEN 5 participants, created 3 days ago → status badge + "5 participantes" + relative date
- GIVEN `participants_count === 0` → participants count hidden