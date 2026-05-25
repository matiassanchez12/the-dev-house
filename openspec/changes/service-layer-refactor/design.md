# Design: service-layer-refactor

## Technical Approach

Extract business logic from Laravel controllers into Service classes and Policies, following the Single Responsibility Principle. Controllers become thin adapters handling routing, FormRequest validation, and Inertia responses. Business logic moves to `app/Services/`, authorization to `app/Policies/`.

## Architecture Decisions

### Decision: Constructor injection for services

**Choice**: Inject services via constructor in controllers
**Alternatives considered**: `app()` helper at call time, method injection
**Rationale**: Enables dependency mocking in tests, explicit dependencies, IDE autocompletion. Project convention matches Laravel's native DI pattern.

### Decision: One service per aggregate

**Choice**: `ProjectService`, `JoinRequestService`, `DashboardService`, `ProfileService`
**Alternatives considered**: Single `BusinessLogicService` god class
**Rationale**: Each service maps to one controller's domain. Matches existing module boundaries and makes testing focused. Proposal scope defines these four explicitly.

### Decision: Validation in FormRequests

**Choice**: Create dedicated `FormRequest` classes for all validation >10 rules
**Alternatives considered**: Inline validation in controllers, generic `ValidatesRequests` trait
**Rationale**: Reuse across requests, testable in isolation, automatic 422 response. Matches OpenSpec config threshold.

### Decision: Policies for authorization

**Choice**: `ProjectPolicy` and `JoinRequestPolicy` using Laravel native Gate/Policy system
**Alternatives considered**: Inline `abort(403)` checks, `AuthorizationMiddleware`
**Rationale**: Native Laravel pattern, automatically registered, `$this->authorize()` in controllers is cleaner than manual gate calls. Proposal specifies these two policies.

## Data Flow

```
HTTP Request
    │
    ▼
Controller::method(FormRequest $request)
    │  - Validates input via FormRequest
    │
    ▼
$this->authorize('action', Policy::class)   ← Policy authorization
    │
    ▼
$service->method(...)                       ← Business logic
    │
    ▼
Model/Collection                            ← Result
    │
    ▼
Inertia::render(...)                        ← Response
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/Services/ProjectService.php` | Create | Slug gen, image upload/delete, project CRUD |
| `app/Services/JoinRequestService.php` | Create | Duplicate/self-join guard, approve/reject/cancel |
| `app/Services/DashboardService.php` | Create | Consolidated dashboard queries |
| `app/Services/ProfileService.php` | Create | Avatar upload/delete, tech sync with pivot |
| `app/Policies/ProjectPolicy.php` | Create | `update`, `delete`, `manage` (owner-only) |
| `app/Policies/JoinRequestPolicy.php` | Create | `approve`, `reject` (owner), `cancel` (applicant) |
| `app/Http/Requests/Project/StoreProjectRequest.php` | Create | title, description, vision, techs, images |
| `app/Http/Requests/Project/UpdateProjectRequest.php` | Create | Same + `remove_images` |
| `app/Http/Requests/JoinRequest/StoreJoinRequestRequest.php` | Create | message validation |
| `app/Http/Requests/Profile/UpdateCompleteProfileRequest.php` | Create | bio, avatar, techs with pivot |
| `app/Http/Controllers/ProjectController.php` | Modify | Slim to routing + FormRequest + service call |
| `app/Http/Controllers/JoinRequestController.php` | Modify | Slim to routing + FormRequest + service call |
| `app/Http/Controllers/DashboardController.php` | Modify | Slim to routing + service call |
| `app/Http/Controllers/ProfileController.php` | Modify | Slim to routing + FormRequest + service call |
| `app/Providers/AppServiceProvider.php` | Modify | Register policies |
| `tests/Unit/Services/ProjectServiceTest.php` | Create | Unit tests for ProjectService |
| `tests/Unit/Services/JoinRequestServiceTest.php` | Create | Unit tests for JoinRequestService |
| `tests/Unit/Services/DashboardServiceTest.php` | Create | Unit tests for DashboardService |
| `tests/Unit/Services/ProfileServiceTest.php` | Create | Unit tests for ProfileService |

## Interfaces / Contracts

### ProjectService

```php
class ProjectService
{
    public function generateUniqueSlug(string $title, ?int $excludeId = null): string;
    public function create(User $user, array $data): Project;
    public function update(Project $project, array $data): Project;
    public function uploadImages(array $files): array;
    public function deleteImages(array $paths): void;
    public function delete(Project $project): void;
}
```

### JoinRequestService

```php
class JoinRequestService
{
    public function validateCanCreate(Project $project, User $user): void; // throws ValidationException
    public function create(Project $project, User $user, string $message): JoinRequest;
    public function approve(JoinRequest $joinRequest): void;
    public function reject(JoinRequest $joinRequest): void;
    public function cancel(JoinRequest $joinRequest): void;
}
```

### DashboardService

```php
class DashboardService
{
    public function getDashboardData(User $user): array;
    // Returns: ['stats' => [...], 'createdProjects' => Collection, 'participatingProjects' => Collection, 'pendingRequests' => Collection, 'sentRequests' => Collection]
}
```

### ProfileService

```php
class ProfileService
{
    public function updateAvatar(User $user, UploadedFile $file): string;
    public function deleteAvatar(User $user): void;
    public function syncTechs(User $user, array $techs): void; // proficiency mapping internal
    public function deleteAccount(User $user): void;
}
```

### Policy Registration (AppServiceProvider)

```php
protected $policies = [
    Project::class => ProjectPolicy::class,
    JoinRequest::class => JoinRequestPolicy::class,
];
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Service logic in isolation | Mock dependencies, test each method |
| Feature | Controller → Service → Model integration | Use `RefreshDatabase`, test HTTP responses |
| Policy | Authorization logic | Test each policy method with owner/non-owner users |

**Coverage target**: ≥80% on service classes. Controller tests ensure full HTTP stack works.

## Migration / Rollback

**No migration required.** Pure refactor — no schema changes.

**Rollback**: Revert controller methods to pre-refactor state. Services/policies are additive; stopping their use requires no removal.

## Open Questions

None — proposal and specs fully define the scope.