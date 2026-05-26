# Design: user-onboarding (Wizard)

## Technical Approach

A 4-step onboarding wizard at `GET /onboarding` that guides new users through tech selection, bio, avatar, and project recommendations. The wizard uses Inertia to submit each step via POST, storing data incrementally. Completion sets `users.onboarding_completed_at`. The flow is dismissible at any point via "Skip All".

## Architecture Decisions

### Decision: Service layer for business logic (not controller-only)

**Choice**: Create `OnboardingService.php` with clear methods, keep controller thin.
**Alternatives considered**: Put logic directly in `OnboardingController` (violates project convention of service-layer business logic).
**Rationale**: Project convention (see `AGENTS.md`) requires business logic in Services. The controller handles routing, validation, and response — nothing more.

### Decision: Proficiency stored as string enum, not numeric

**Choice**: Use `ProfileService::PROFICIENCY_MAP` to convert numeric 1-5 from form → string values in DB.
**Alternatives considered**: Store numeric 1-5 directly in DB.
**Rationale**: Existing `user_tech.proficiency` column stores strings (`'basic'`, `'intermediate'`, `'advanced'`, `'expert'`). The `ProfileService::syncTechs()` already handles this conversion. Onboarding must reuse this logic.

### Decision: Single-page wizard with client-side step navigation

**Choice**: One React page (`onboarding/index.tsx`) with `useState` for step tracking, Inertia POSTs per step.
**Alternatives considered**: Separate Inertia page per step with full route navigation.
**Rationale**: Simpler UX (no URL change between steps), easier state management, avoids route complexity.

### Decision: Recommendations via dedicated endpoint, not embedded in page

**Choice**: `GET /onboarding/recommendations` returns JSON of matching projects.
**Alternatives considered**: Fetch recommendations as part of the initial `index()` call.
**Rationale**: Only needed on step 4 — lazy-loading avoids unnecessary work. The endpoint is reusable if onboarding is reshown later.

## Data Flow

```
User registers → auth middleware → DashboardController
    ↓ (checks onboarding_completed_at)
DashboardController redirects → OnboardingController::index()
    ↓
Inertia renders onboarding/index.tsx (step 1)
    ↓ POST /onboarding/step-1 (techs + proficiency)
OnboardingService::saveStep1() → ProfileService::syncTechs()
    ↓ redirect (step 2)
...step 2: bio → step 3: avatar → step 4: recommendations...
    ↓ POST /onboarding/step-4 (selected project IDs)
OnboardingService::saveStep4() → creates JoinRequests
    ↓
OnboardingService::complete() → sets onboarding_completed_at
    ↓ redirect /dashboard
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database/migrations/xxxx_add_onboarding_completed_at_to_users_table.php` | Create | Adds nullable `onboarding_completed_at` timestamp after `email_verified_at` |
| `app/Models/User.php` | Modify | Add `onboarding_completed_at` to `$fillable`; add `hasCompletedOnboarding()` method |
| `app/Services/OnboardingService.php` | Create | Business logic: save steps, recommendations query, completion |
| `app/Http/Controllers/OnboardingController.php` | Create | Thin controller: route handling, service delegation, Inertia response |
| `routes/web.php` | Modify | Add auth-grouped routes for onboarding (7 routes) |
| `resources/js/layouts/onboarding.tsx` | Create | Centered layout with progress bar, step counter, skip link |
| `resources/js/pages/onboarding/index.tsx` | Create | Wizard with 4 sub-step components |
| `app/Http/Requests/StoreTechsRequest.php` | Create | Validate step 1 techs array |
| `app/Http/Requests/StoreBioRequest.php` | Create | Validate step 2 bio (max 500 chars) |
| `app/Http/Requests/StoreAvatarRequest.php` | Create | Validate step 3 avatar (image, max 2MB) |

## Key Interfaces

### User Model

```php
// $fillable adds: 'onboarding_completed_at'

public function hasCompletedOnboarding(): bool
{
    return $this->onboarding_completed_at !== null;
}
```

### OnboardingService

```php
class OnboardingService
{
    public function __construct(
        private ProfileService $profileService
    ) {}

    public function saveStep1(User $user, array $techs): void
    {
        // $techs: [{id: 1, proficiency: 3}, ...] — numeric proficiency from form
        // ProfileService::syncTechs() converts to string via PROFICIENCY_MAP
        $this->profileService->syncTechs($user, $techs);
    }

    public function saveStep2(User $user, string $bio): void
    {
        $user->update(['bio' => $bio]);
    }

    public function saveStep3(User $user, ?UploadedFile $avatar): void
    {
        if ($avatar) {
            $this->profileService->updateAvatar($user, $avatar);
        }
    }

    /**
     * @param int[] $projectIds
     */
    public function saveStep4(User $user, array $projectIds): void
    {
        foreach ($projectIds as $projectId) {
            $project = Project::find($projectId);
            if (!$project || $project->user_id === $user->id) continue;

            $exists = JoinRequest::where('user_id', $user->id)
                ->where('project_id', $projectId)
                ->exists();

            if (!$exists) {
                JoinRequest::create([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                    'status' => 'pending',
                    'message' => 'Interested from onboarding',
                ]);
            }
        }
    }

    public function getRecommendations(User $user): Collection
    {
        $userTechIds = $user->techs()->pluck('techs.id')->toArray();

        return Project::where('status', 'open')
            ->whereHas('techs', fn($q) => $q->whereIn('techs.id', $userTechIds))
            ->with(['techs', 'creator'])
            ->get()
            ->sortByDesc(fn($p) => count(array_intersect(
                $p->techs->pluck('id')->toArray(),
                $userTechIds
            )))
            ->take(5)
            ->values();
    }

    public function complete(User $user): void
    {
        $user->update(['onboarding_completed_at' => now()]);
    }
}
```

### DashboardService Update

```php
// In getDashboardData(), append:
'isProfileComplete' => $user->onboarding_completed_at !== null,
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `OnboardingService::saveStep1` syncs techs correctly | `tests/Unit/OnboardingServiceTest.php` |
| Unit | `OnboardingService::saveStep4` skips own projects & duplicates | `tests/Unit/OnboardingServiceTest.php` |
| Unit | `OnboardingService::getRecommendations` orders by relevance | `tests/Unit/OnboardingServiceTest.php` |
| Feature | `GET /onboarding` redirects when completed | `tests/Feature/OnboardingTest.php` |
| Feature | `POST /onboarding/step-1` saves techs with proficiency | `tests/Feature/OnboardingTest.php` |
| Feature | `POST /onboarding/skip` sets completion flag | `tests/Feature/OnboardingTest.php` |
| Feature | Dashboard includes `isProfileComplete` flag | `tests/Feature/DashboardTest.php` |

## Migration / Rollout

1. Run migration: `php artisan migrate`
2. Existing users with `onboarding_completed_at = null` will see wizard on next login
3. Users who already completed profile manually (have bio + avatar + techs) — no automatic detection. Manual DB update or follow-up task to backfill `onboarding_completed_at` for existing users is out of scope.

## Open Questions

- [x] Proficiency mismatch (numeric form vs string DB) — resolved via `ProfileService::PROFICIENCY_MAP`
- [ ] Should existing users with complete profiles see the wizard? No — `hasCompletedOnboarding()` returns false for them unless `onboarding_completed_at` is backfilled. May want a one-time migration to backfill.
- [ ] Step 4 "Guardar" (bookmark) — spec says "bookmark to session" but session bookmarks are out of scope. Only "Enviar solicitud" (join request) is implemented.
