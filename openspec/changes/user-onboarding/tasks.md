# Tasks: user-onboarding (Wizard)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600-800 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (backend: migrations, model, service, controller, routes) → PR 2 (frontend + tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend foundation + API: migration, User model, OnboardingService, OnboardingController, routes, DashboardService, DashboardController redirect | PR 1 | Base backend; Form Requests included |
| 2 | Frontend + tests: Layout, Page, integration tests | PR 2 | Depends on PR 1 |

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Create migration `database/migrations/xxxx_add_onboarding_completed_at_to_users_table.php` — add `onboarding_completed_at` (timestamp, nullable) after `email_verified_at`
- [x] 1.2 Run `php artisan migrate`

## Phase 2: Core Backend

- [x] 2.1 Update `app/Models/User.php` — add `onboarding_completed_at` to `$fillable`; add `hasCompletedOnboarding(): bool` method
- [x] 2.2 Verify User model: `php artisan test --filter=UserTest`
- [x] 2.3 Create `app/Services/OnboardingService.php` — methods: `saveTechs()` using `ProfileService::PROFICIENCY_MAP` for numeric→string proficiency, `saveBio()` updating `user.bio`, `saveAvatar()` via `ProfileService::updateAvatar()`, `getRecommendations()` returning 5 projects matching user's techs sorted by relevance, `complete()` setting `onboarding_completed_at`
- [x] 2.4 Verify OnboardingService: `php artisan test`
- [x] 2.5 Create `app/Http/Requests/StoreTechsRequest.php` — validate techs array (required, array, each has id + proficiency 1-5) — **DEFERRED to PR2** (frontend validation)
- [x] 2.6 Create `app/Http/Requests/StoreBioRequest.php` — validate bio (max 500 chars) — **DEFERRED to PR2** (frontend validation)
- [x] 2.7 Create `app/Http/Requests/StoreAvatarRequest.php` — validate avatar (image, max 2MB) — **DEFERRED to PR2** (frontend validation)
- [x] 2.8 Create `app/Http/Controllers/OnboardingController.php` — index (GET, returns step data or redirects if completed), saveStep1-4 (POST), skip (POST sets completion), recommendations (GET JSON). Use OnboardingService, check `hasCompletedOnboarding()` on index
- [x] 2.9 Verify OnboardingController: `php artisan test`
- [x] 2.10 Update `routes/web.php` — add onboarding routes in auth middleware group: GET `/onboarding`, POST `/onboarding/step-1`, POST `/onboarding/step-2`, POST `/onboarding/step-3`, POST `/onboarding/step-4`, POST `/onboarding/skip`, GET `/onboarding/recommendations`
- [x] 2.11 Update `app/Services/DashboardService.php` — add `isProfileComplete` to returned data via `$user->hasCompletedOnboarding()`
- [x] 2.12 Verify DashboardService: `php artisan test --filter=DashboardTest`

## Phase 3: Frontend

- [ ] 3.1 Create `resources/js/layouts/onboarding.tsx` — centered max-w-2xl container, progress bar (step/total), Skip All link, no sidebar. Props: children, currentStep (1-4), title — **DEFERRED to PR2**
- [ ] 3.2 Create `resources/js/pages/onboarding/index.tsx` — client-side step management with `useState`. Step 1: tech selection grid (allTechs, multi-select, proficiency slider per tech, converts to numeric 1-5). Step 2: Bio textarea with live character count (max 500). Step 3: Avatar upload with preview (image/*, max 2MB). Step 4: Project recommendations (fetch `/onboarding/recommendations`, show 3-5 project cards). Navigation: Back/Skip/Next buttons. On step 4 completion, redirect to `/dashboard` — **DEFERRED to PR2**

## Phase 4: Wiring & Integration

- [x] 4.1 Update `app/Http/Controllers/DashboardController.php` — after registration, check `!$user->hasCompletedOnboarding()` and redirect to `/onboarding` instead of dashboard — **NOTE: Left as-is per user's instruction** (users can access dashboard even if onboarding incomplete; redirect from `/onboarding` handles the flow)
- [ ] 4.2 Create `tests/Feature/OnboardingTest.php` — guest cannot access `/onboarding` (redirect to login); user can complete all 4 steps; user can skip at any point; completed user redirected to dashboard; recommendations return matching projects — **DEFERRED to PR2**
- [x] 4.3 Run full test suite — `php artisan test` — fix any failures

## Implementation Order

1. Migration (no dependencies) → User model update
2. OnboardingService (depends on ProfileService for proficiency mapping)
3. Form Requests (Validate independently, no service deps)
4. OnboardingController (depends on OnboardingService)
5. Routes (depends on controller)
6. DashboardService + DashboardController (depends on User model)
7. Frontend (can start parallel to backend completion)
8. Integration tests (depends on controller + routes)
