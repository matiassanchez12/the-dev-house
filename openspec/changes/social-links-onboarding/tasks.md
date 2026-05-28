# Tasks: Social Links Onboarding

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300-400 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR — all files are tightly coupled to one feature |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Migration + Model + FormRequest + Service + Controller + Route + Frontend + Tests | PR 1 | Single cohesive feature, all tests included |

## Phase 1: Foundation (Database + Model)

- [x] 1.1 Create migration `database/migrations/{timestamp}_create_social_links_table.php` with columns: `id`, `user_id` (FK → users, cascadeOnDelete), `platform` enum('github','linkedin','twitter','website'), `url` string(2048), timestamps, unique composite index on `(user_id, platform)`.
- [x] 1.2 Create model `app/Models/SocialLink.php` with `HasFactory`, `$fillable = ['platform', 'url', 'user_id']` (alphabetical), `belongsTo(User)` relationship named `user`.
- [x] 1.3 Add `socialLinks()` hasMany relationship to `app/Models/User.php`: `return $this->hasMany(SocialLink::class);`.

## Phase 2: Backend Logic (Validation + Service + Controller + Route)

- [x] 2.1 Create `app/Http/Requests/Onboarding/SaveStepSocialLinksRequest.php` with `authorize(): true`, rules: `links` → required|array, `links.*.platform` → required|in:github,linkedin,twitter,website, `links.*.url` → required|url|max:2048. Include Spanish error messages matching existing pattern.
- [x] 2.2 Add `saveSocialLinks(User $user, array $links): void` method to `app/Services/OnboardingService.php`: return early if empty, map links to records with user_id/platform/url, call `SocialLink::upsert($records, ['user_id', 'platform'], ['url'])`. Import `SocialLink` model.
- [x] 2.3 Add `saveStepSocialLinks(SaveStepSocialLinksRequest $request)` method to `app/Http/Controllers/OnboardingController.php`: call `$this->onboardingService->saveSocialLinks(Auth::user(), $request->validated()['links'])`, redirect to `onboarding.index`. Import the FormRequest.
- [x] 2.4 Add route in `routes/web.php` inside auth group: `Route::post('/onboarding/step-social-links', [OnboardingController::class, 'saveStepSocialLinks'])->name('onboarding.step-social-links');`.

## Phase 3: Frontend Integration

- [x] 3.1 Add `Platform` type and `SocialLink` interface to `resources/js/types/index.ts`: `export type Platform = 'github' | 'linkedin' | 'twitter' | 'website';`.
- [x] 3.2 In `resources/js/pages/onboarding/index.tsx`: change `totalSteps` from 4 to 5. Add step 3 state for social links (object with platform keys → url strings). Add inline SVG icon helper object for 4 platforms (GitHub, LinkedIn, Twitter, Website).
- [x] 3.3 In `handleNext`: add branch for `currentStep === 3` — filter non-empty links, POST to `/onboarding/step-social-links` with `{ links: [...] }`, then `setCurrentStep(4)`.
- [x] 3.4 In `handleBack`: no change needed (decrements naturally).
- [x] 3.5 Add step 3 UI block between step 2 (bio) and step 3 (avatar → becomes 4): render 4 platform rows with icon + URL input, inline validation via Inertia errors, preview section showing entered links as clickable badges, "Skip" option (calls existing `handleSkip`).
- [x] 3.6 Renumber existing step 3 (avatar) to `currentStep === 4` and step 4 (recommendations) to `currentStep === 5`. Update all CardTitle, CardDescription, and button text references. Update recommendations `useEffect` trigger from `currentStep === 4` to `currentStep === 5`. Update "Finalizar" button condition from `currentStep === 4` to `currentStep === 5`.

## Phase 4: Testing

- [x] 4.1 Add test `test_user_can_complete_step_social_links`: authenticated user POSTs valid links array to `/onboarding/step-social-links`, assert redirect to `/onboarding`, assert `social_links` table has correct rows.
- [x] 4.2 Add test `test_social_links_invalid_url_rejected`: POST with `links: [{platform: 'github', url: 'not-a-url'}]`, assert 422 response.
- [x] 4.3 Add test `test_social_links_invalid_platform_rejected`: POST with `links: [{platform: 'facebook', url: 'https://facebook.com/u'}]`, assert 422 response.
- [x] 4.4 Add test `test_social_links_empty_array_rejected`: POST with `links: []`, assert 422 response.
- [x] 4.5 Add test `test_social_links_upsert_updates_existing`: create existing GitHub link, POST new GitHub URL, assert record updated (no duplicate), assert count remains 1.
- [x] 4.6 Add test `test_social_links_cascade_delete`: create user with social links, delete user, assert `social_links` table has no rows for that user.
- [x] 4.7 Add test `test_onboarding_total_steps_is_five`: assert onboarding page renders with `totalSteps` equal to 5 (verify via Inertia props or response structure).
