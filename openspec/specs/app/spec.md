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