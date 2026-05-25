# Tasks: service-layer-refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1340 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Phase 1-2 (FormRequests + Services) → Phase 3-4 (Policies + Controllers) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

**Decision needed before apply**: Yes
**Chained PRs recommended**: Yes
**Chain strategy**: stacked-to-main
**400-line budget risk**: High

## Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| 1 | FormRequests + Services (dependency-free) | PR 1 | Base = main; tests + new files |
| 2 | Policies + Controller refactors (depends on services) | PR 2 | Base = PR 1 branch |

---

## Phase 1: FormRequests (TDD — RED first)

- [ ] 1.1 **Test** `tests/Unit/Requests/Project/StoreProjectRequestTest.php` — validate title (required, unique, max 255), description (required, max 1000), techs (array, min 1), images (max 5, each 2MB)
- [ ] 1.2 **Implement** `app/Http/Requests/Project/StoreProjectRequest.php` — validation rules per spec
- [ ] 1.3 **Test** `tests/Unit/Requests/Project/UpdateProjectRequestTest.php` — same as Store + remove_images array validation
- [ ] 1.4 **Implement** `app/Http/Requests/Project/UpdateProjectRequest.php` — extends StoreProjectRequest, adds remove_images
- [ ] 1.5 **Test** `tests/Unit/Requests/JoinRequest/StoreJoinRequestRequestTest.php` — validate message (required, min 10, max 500)
- [ ] 1.6 **Implement** `app/Http/Requests/JoinRequest/StoreJoinRequestRequest.php` — message validation only
- [ ] 1.7 **Test** `tests/Unit/Requests/Profile/UpdateCompleteProfileRequestTest.php` — validate bio (optional, max 1000), avatar (image file, max 2MB, jpg/png/webp), techs (array of {id, proficiency})
- [ ] 1.8 **Implement** `app/Http/Requests/Profile/UpdateCompleteProfileRequest.php` — bio + avatar + techs with pivot validation

## Phase 2: Services (TDD — RED first)

- [ ] 2.1 **Test** `tests/Unit/Services/ProjectServiceTest.php` — slug gen, image upload/delete, create/update/delete with tech associations
- [ ] 2.2 **Implement** `app/Services/ProjectService.php` — generateUniqueSlug, create, update, uploadImages, deleteImages, delete
- [ ] 2.3 **Test** `tests/Unit/Services/JoinRequestServiceTest.php` — validateCanCreate (duplicate/self-join), create, approve, reject, cancel
- [ ] 2.4 **Implement** `app/Services/JoinRequestService.php` — validateCanCreate, create, approve, reject, cancel
- [ ] 2.5 **Test** `tests/Unit/Services/DashboardServiceTest.php` — getDashboardData returns all 5 keys
- [ ] 2.6 **Implement** `app/Services/DashboardService.php` — getDashboardData with stats + 4 collections
- [ ] 2.7 **Test** `tests/Unit/Services/ProfileServiceTest.php` — updateAvatar, deleteAvatar, syncTechs with pivot, deleteAccount
- [ ] 2.8 **Implement** `app/Services/ProfileService.php` — updateAvatar, deleteAvatar, syncTechs, deleteAccount

## Phase 3: Policies (TDD — RED first)

- [x] 3.1 **Test** `tests/Unit/Policies/ProjectPolicyTest.php` — update/delete/manage allow owner, deny others
- [x] 3.2 **Implement** `app/Policies/ProjectPolicy.php` — owner-only update, delete, manage
- [x] 3.3 **Test** `tests/Unit/Policies/JoinRequestPolicyTest.php` — approve/reject allow owner, cancel allows applicant
- [x] 3.4 **Implement** `app/Policies/JoinRequestPolicy.php` — owner approve/reject, applicant cancel

## Phase 4: Controllers (DEPEND on services + policies + requests)

- [x] 4.1 **Refactor** `app/Http/Controllers/ProjectController.php` — inject ProjectService, use StoreProjectRequest/UpdateProjectRequest, $this->authorize()
- [x] 4.2 **Refactor** `app/Http/Controllers/JoinRequestController.php` — inject JoinRequestService, use StoreJoinRequestRequest, JoinRequestPolicy
- [x] 4.3 **Refactor** `app/Http/Controllers/DashboardController.php` — inject DashboardService, single method
- [x] 4.4 **Refactor** `app/Http/Controllers/ProfileController.php` — inject ProfileService, use UpdateCompleteProfileRequest
- [x] 4.5 **Update** `app/Providers/AppServiceProvider.php` — register ProjectPolicy + JoinRequestPolicy

## Phase 5: Verification

- [ ] 5.1 Run full test suite: `php artisan test`
- [ ] 5.2 Verify ≥80% coverage on service classes