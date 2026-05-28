# Delta for App Architecture

## ADDED Requirements

### Requirement: OnboardingService Social Links Method

The `OnboardingService` MUST include a `saveSocialLinks(User $user, array $links): void` method that:
- Receives an array of `{platform, url}` pairs
- Upserts each link using `updateOrCreate` on the `(user_id, platform)` unique constraint
- Does NOT delete links not included in the submission

#### Scenario: service creates new links
- GIVEN user has no social links
- WHEN `saveSocialLinks` is called with GitHub + Twitter data
- THEN two SocialLink records are created

#### Scenario: service updates existing link
- GIVEN user has a GitHub link with old URL
- WHEN `saveSocialLinks` is called with new GitHub URL
- THEN the existing record is updated, no duplicate created

### Requirement: OnboardingController Social Links Endpoint

The `OnboardingController` MUST expose `saveStepSocialLinks()` method handling `POST /onboarding/step-social-links` that:
- Injects `SaveStepSocialLinksRequest` for validation
- Calls `OnboardingService::saveSocialLinks()`
- Redirects to the avatar onboarding step on success

#### Scenario: controller saves and redirects
- GIVEN valid request with social links data
- WHEN `saveStepSocialLinks` is called
- THEN service method is invoked and user redirects to avatar step

### Requirement: SaveStepSocialLinksRequest FormRequest

The system MUST provide `app/Http/Requests/Onboarding/SaveStepSocialLinksRequest.php` with validation rules:
- `links` — required, array
- `links.*.platform` — required, in:github,linkedin,twitter,website
- `links.*.url` — required, url, max:2048

#### Scenario: request authorizes authenticated user
- GIVEN authenticated user
- WHEN `authorize()` is called
- THEN returns true

#### Scenario: request returns validation rules
- WHEN `rules()` is called
- THEN returns the links array validation rules

## MODIFIED Requirements

### Requirement: Onboarding Flow Steps

The onboarding flow MUST have 5 steps total (previously 4):

| Step | Name | Route/Endpoint |
|------|------|----------------|
| 1 | Techs | existing |
| 2 | Bio | existing |
| 2.5 | Social Links | `POST /onboarding/step-social-links` |
| 4 | Avatar | existing (renumbered from 3) |
| 5 | Recommendations | existing (renumbered from 4) |

The `OnboardingService` MUST track step progression accounting for the new step. The frontend `totalSteps` MUST be 5 (previously 4).
(Previously: onboarding had 4 steps: techs, bio, avatar, recommendations)

#### Scenario: user progresses through all 5 steps
- GIVEN user starts onboarding at step 1
- WHEN they complete each step sequentially
- THEN they reach step 5 (recommendations) and complete onboarding

#### Scenario: social links step is optional
- GIVEN user is on step 2.5 (social links)
- WHEN they click "Skip"
- THEN they proceed to step 4 (avatar) without saving links
