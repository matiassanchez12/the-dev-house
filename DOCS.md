# DevHouse — Project Documentation

## Overview

DevHouse is a collaborative platform where developers create projects, recruit team members, and work together. The platform connects project creators with potential collaborators based on technologies used.

---

## Domain Model

### Entities

#### User
```
- id, name, email, password, bio, avatar
- timestamps
```

**Relationships:**
- `createdProjects` → hasMany(Project) — projects this user created
- `participatingProjects` → belongsToMany(Project) — projects where user is a participant
- `techs` → belongsToMany(Tech) — technologies user knows, with `years_experience` and `proficiency` pivot
- `sentJoinRequests` → hasMany(JoinRequest) — requests user sent
- `receivedJoinRequests` → hasManyThrough(JoinRequest, Project) — requests to user's projects
- `messages` → hasMany(Message) — chat messages

---

#### Project
```
- id, user_id (creator), title, slug, description, vision
- images (array of paths), status (draft|open|in_progress|completed)
- repository_url, demo_url
- timestamps
```

**Relationships:**
- `creator` → belongsTo(User) — the project founder
- `techs` → belongsToMany(Tech) — technologies required
- `participants` → belongsToMany(User) — approved team members
- `joinRequests` → hasMany(JoinRequest) — all applications
- `messages` → hasMany(Message) — project chat

**Status Flow:** `draft → open → in_progress → completed`

---

#### JoinRequest
```
- id, project_id, user_id (applicant), message, status (pending|approved|rejected)
- reviewed_at (timestamp when creator decided)
- timestamps
```

**Status Flow:** `pending → approved | rejected`

**Note:** When approved, user is added to project's `participants` via `project_participants` pivot table.

---

#### Tech
```
- id, name, slug, icon
- timestamps
```

**Used for:** Project tech requirements and user skill profiles.

---

#### Message (Chat)
```
- id, project_id, user_id (author), content
- timestamps
```

Project chat system for team communication.

---

### Database Schema

```
users
├── id, name, email, password, bio, avatar, email_verified_at
├── timestamps

projects
├── id, user_id, title, slug, description, vision
├── images (JSON array), status, repository_url, demo_url
├── timestamps

techs
├── id, name, slug, icon
├── timestamps

project_tech (pivot)
├── project_id, tech_id, level, timestamps

project_participants (pivot)
├── project_id, user_id, role, joined_at, timestamps

user_tech (pivot)
├── user_id, tech_id, years_experience, proficiency, timestamps

join_requests
├── id, project_id, user_id, message, status, reviewed_at
├── timestamps

messages
├── id, project_id, user_id, content, timestamps
```

---

## Architecture

### Current State (Before Refactor)

Controllers contain mixed responsibilities:

| Controller | Issues |
|------------|--------|
| `ProjectController` | Slug generation, image upload/delete, validation, ownership checks — ALL in controller |
| `JoinRequestController` | Business rules (duplicate check, self-join), approve/reject/cancel logic |
| `DashboardController` | 5 separate queries in one method |
| `ProfileController` | Avatar handling, tech sync with pivot data |

**Problem:** Fat controllers violate Single Responsibility Principle. Business logic scattered makes testing difficult.

---

### Target Architecture: Service Layer

```
app/
├── Http/
│   ├── Controllers/        # THIN: routing + FormRequest validation + Inertia response
│   └── Requests/           # FormRequest classes per action
│       ├── Project/
│       │   ├── StoreProjectRequest.php
│       │   └── UpdateProjectRequest.php
│       ├── JoinRequest/
│       │   └── StoreJoinRequestRequest.php
│       └── Profile/
│           └── UpdateCompleteProfileRequest.php
├── Services/               # Business logic + DB access
│   ├── ProjectService.php
│   ├── JoinRequestService.php
│   ├── DashboardService.php
│   └── ProfileService.php
├── Policies/               # Authorization (Laravel native)
│   ├── ProjectPolicy.php
│   └── JoinRequestPolicy.php
└── Models/                 # Eloquent models + relationships only
```

**Service Layer Rules:**
1. One service per aggregate (ProjectService handles Project + related operations)
2. Services receive primitive types/arrays, return models/collections
3. Controllers inject services via constructor or `app()` helper
4. **Policies handle authorization**, **Services handle business logic**
5. Keep Eloquent queries in Models, never in Controllers

---

## Conventions

### Controllers (THIN)
- Method order: index, create, store, show, edit, update, destroy
- Validation via FormRequest (not inline arrays)
- Call service methods, return Inertia response
- Authorization via Policies, not inline checks

### Form Requests
- One class per action: `StoreProjectRequest`, `UpdateProjectRequest`
- Use Laravel validation rules
- Place in `app/Http/Requests/{Resource}/`

### Services
- One public method per use case
- Inject dependencies via constructor
- Return domain objects (models, collections)
- No HTTP knowledge (no Request/Response objects)

### Policies
- One policy per model
- Use for authorization checks (ownership, roles)
- Methods: `create`, `update`, `delete`, `view`, `manage`

### Models
- `use HasFactory;` on every model
- Relationships first, scopes second, custom methods last
- `$fillable` sorted alphabetically
- `$casts` for JSON, dates, etc.

### Migrations
- One migration per table change
- Never modify existing migrations
- Use `$table->foreignId()` for foreign keys

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React 18 + TypeScript |
| Routing | Inertia.js (SPA without REST API) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Testing | PHPUnit (Laravel's built-in test runner) |
| Code Quality | Pint (Laravel formatter) |

---

## Testing

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test --filter ProjectTest
```

**TDD is mandatory.** Write tests before code. Minimum 80% coverage on critical features.

---

## Routes Overview

### Public
- `GET /` — Landing page
- `GET /projects` — Project listing (with filters)
- `GET /projects/{slug}` — Project detail

### Authenticated
- `GET /dashboard` — User dashboard
- `GET /profile/edit` — Profile edit form
- `POST /profile/update-complete` — Update bio, avatar, techs
- `DELETE /profile` — Delete account

### Project Management (Creator)
- `GET /projects/create` — Create form
- `POST /projects` — Create project
- `GET /projects/{project}/edit` — Edit form
- `PUT /projects/{project}` — Update project
- `DELETE /projects/{project}` — Delete project

### Join Requests
- `GET /join-requests` — List received and sent requests
- `POST /projects/{project}/join` — Send join request
- `POST /join-requests/{joinRequest}/approve` — Approve
- `POST /join-requests/{joinRequest}/reject` — Reject
- `DELETE /join-requests/{joinRequest}` — Cancel (applicant only)

---

## Environment

```
# .env keys needed
DB_CONNECTION, DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
SESSION_DRIVER, CACHE_DRIVER, QUEUE_CONNECTION
BROADCAST_DRIVER (optional, for real-time chat)
MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD
MAIL_FROM_ADDRESS, MAIL_FROM_NAME
```

Production mail delivery should use a real SMTP provider; local Sail can keep using Mailpit/log.

---

## Notes

- Images stored in `storage/app/public/projects/` and `storage/app/public/avatars/`
- Slug generation: title converted to lowercase hyphenated, with counter suffix if duplicate
- Projects support multiple images (stored as JSON array)
- Tech proficiency values: `basic`, `intermediate`, `advanced`, `expert`, `master`
