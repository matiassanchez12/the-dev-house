# Proposal: service-layer-refactor

## Intent

Extract business logic from Laravel controllers into a Service Layer to follow the Single Responsibility Principle. Controllers currently handle HTTP request/response, slug generation, image uploads, duplicate checks, permission logic, and data synchronization — all mixed together. Separating these concerns makes business logic testable in isolation and keeps controllers as thin routing-and-validation adapters.

## Scope

### In Scope
- Extract `ProjectService` from `ProjectController` (slug, image upload/delete, creation/update, ownership checks)
- Extract `JoinRequestService` from `JoinRequestController` (duplicate check, self-join guard, approve/reject/cancel, participant attachment)
- Extract `DashboardService` from `DashboardController` (5 queries → consolidated data access)
- Extract `ProfileService` from `ProfileController` (avatar upload/delete, proficiency mapping, tech sync)
- Extract `ProjectPolicy` and `JoinRequestPolicy` using Laravel's native policy system
- Create `FormRequest` classes for all validation (>10 rules per OpenSpec config)
- Keep controllers thin: routing, validation via FormRequest, Inertia response only
- Refactor only — preserve all existing behavior, no new features

### Out of Scope
- ORM changes (Eloquent is fine)
- New API endpoints
- Frontend changes
- Database schema changes

## Capabilities

### New Capabilities
- `controller-service-separation`: Business logic isolated in `app/Services/` with Laravel's native DI via constructor injection

### Modified Capabilities
- None — pure refactor preserves existing spec behavior

## Approach

1. Create `app/Services/` directory with one service class per controller
2. Create `app/Policies/` directory with one policy class per resource requiring authorization
3. Move all non-HTTP logic from controllers into services; controllers call `$service->method()`
4. Extract validation rules into `app/Http/Requests/{Resource}/` FormRequest classes
5. Register policies in `AppServiceProvider` and apply via `$this->authorize()` in controllers
6. Write unit tests for each service (test logic in isolation)
7. Run full test suite — all existing tests must pass with no regressions

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Http/Controllers/ProjectController.php` | Modified | Slim down to routing + FormRequest validation + service call |
| `app/Http/Controllers/JoinRequestController.php` | Modified | Slim down to routing + FormRequest validation + service call |
| `app/Http/Controllers/DashboardController.php` | Modified | Slim down to routing + service call |
| `app/Http/Controllers/ProfileController.php` | Modified | Slim down to routing + FormRequest validation + service call |
| `app/Services/ProjectService.php` | New | Slug gen, image upload/delete, project CRUD |
| `app/Services/JoinRequestService.php` | New | Duplicate check, self-join guard, approve/reject/cancel |
| `app/Services/DashboardService.php` | New | Consolidated dashboard queries |
| `app/Services/ProfileService.php` | New | Avatar upload/delete, proficiency mapping, tech sync |
| `app/Policies/ProjectPolicy.php` | New | Ownership checks |
| `app/Policies/JoinRequestPolicy.php` | New | Participant checks |
| `app/Http/Requests/Project/` | New | StoreProjectRequest, UpdateProjectRequest |
| `app/Http/Requests/JoinRequest/` | New | CreateJoinRequestRequest |
| `app/Http/Requests/Profile/` | New | UpdateProfileRequest |
| `tests/Unit/Services/` | New | Unit tests per service |
| `tests/Feature/` | Modified | Update controller tests to go through full HTTP stack |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regression from moving logic | Low | Run full test suite after each service extraction; stop on first failure |
| Policy authorization gaps | Low | Write policy tests before removing auth logic from controllers |
| FormRequest validation gaps | Low | Audit all validation rules before removing inline `validate()` calls |

## Rollback Plan

Revert each controller to its pre-refactor state by restoring the original method bodies. Services and policies are additive-only, so rollback does not require removing them — just stop calling them. Use `git stash` on uncommitted changes if regressions appear mid-refactor.

## Dependencies

- Laravel 12 Policy system (native, no package)
- Existing test suite must pass before and after each extraction step

## Success Criteria

- [ ] `ProjectService`, `JoinRequestService`, `DashboardService`, `ProfileService` exist with all business logic moved out of controllers
- [ ] `ProjectPolicy`, `JoinRequestPolicy` exist and are used in controllers via `$this->authorize()`
- [ ] FormRequest classes exist for all controller validation (>10 rules)
- [ ] Controller methods are ≤15 lines each
- [ ] `php artisan test` passes with zero new failures
- [ ] Service unit tests cover all extracted logic (≥80% coverage on services)
- [ ] No regression in user-facing behavior (all Inertia responses unchanged)