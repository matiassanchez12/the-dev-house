# Social Links Specification

## Purpose

Defines the storage, model, validation, and onboarding integration for user social media links (GitHub, LinkedIn, Twitter, Website). This is the foundational backend + onboarding UI for social links; profile editing and public display are handled by a subsequent change.

## Requirements

### Requirement: Social Links Data Model

The system MUST store social links in a `social_links` table with the following schema:

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT | Primary Key |
| `user_id` | BIGINT UNSIGNED | FK → users.id, NOT NULL, CASCADE DELETE |
| `platform` | ENUM('github','linkedin','twitter','website') | NOT NULL |
| `url` | VARCHAR(2048) | NOT NULL |
| `created_at` | TIMESTAMP | NULLABLE |
| `updated_at` | TIMESTAMP | NULLABLE |

A UNIQUE composite index on `(user_id, platform)` MUST exist to prevent duplicate links per platform per user.

#### Scenario: user saves first social link
- GIVEN an authenticated user with no social links
- WHEN they submit a valid platform + URL pair
- THEN a row is inserted into `social_links`

#### Scenario: duplicate platform prevented
- GIVEN a user already has a GitHub link saved
- WHEN they attempt to save another GitHub link
- THEN the unique constraint prevents the duplicate

#### Scenario: cascade delete on user removal
- GIVEN a user with social links
- WHEN the user account is deleted
- THEN all their social_links rows are removed via FK cascade

### Requirement: SocialLink Model

The system MUST provide an Eloquent `SocialLink` model with:
- `$fillable = ['user_id', 'platform', 'url']` (alphabetically sorted)
- `use HasFactory;`
- `belongsTo(User)` relationship named `user`

#### Scenario: model creates with fillable attributes
- GIVEN valid `user_id`, `platform`, `url` data
- WHEN `SocialLink::create()` is called
- THEN the record persists with all three attributes

#### Scenario: user relationship resolves
- GIVEN a SocialLink instance
- WHEN `$socialLink->user` is accessed
- THEN the associated User model is returned

### Requirement: Social Link Validation

The system MUST validate social link submissions through a dedicated `FormRequest` class with these rules:

| Field | Rules |
|-------|-------|
| `links` | required, array |
| `links.*.platform` | required, string, in:github,linkedin,twitter,website |
| `links.*.url` | required, url, max:2048 |

The system MUST NOT validate URL existence (no HTTP requests). The system MUST accept any syntactically valid URL regardless of platform-specific patterns.

#### Scenario: valid links array passes validation
- GIVEN `links: [{platform: 'github', url: 'https://github.com/user'}]`
- WHEN the request is validated
- THEN validation passes

#### Scenario: empty links array fails validation
- GIVEN `links: []`
- WHEN the request is validated
- THEN validation fails with "links is required" error

#### Scenario: invalid platform rejected
- GIVEN `links: [{platform: 'facebook', url: 'https://facebook.com/user'}]`
- WHEN the request is validated
- THEN validation fails with platform not in allowed values

#### Scenario: invalid URL rejected
- GIVEN `links: [{platform: 'github', url: 'not-a-url'}]`
- WHEN the request is validated
- THEN validation fails with URL format error

#### Scenario: URL exceeding max length rejected
- GIVEN a URL longer than 2048 characters
- WHEN the request is validated
- THEN validation fails with max length error

### Requirement: Onboarding Social Links Service

The `OnboardingService` MUST provide a `saveSocialLinks(User $user, array $links): void` method that:
- Accepts an array of `{platform, url}` pairs
- Upserts each link (create if new, update if existing for same platform)
- Does NOT remove links not included in the array (additive only during onboarding)

#### Scenario: new links are created
- GIVEN a user with no social links
- WHEN `saveSocialLinks` is called with `[{platform: 'github', url: '...'}]`
- THEN a GitHub social link is created for that user

#### Scenario: existing links are updated
- GIVEN a user with an existing GitHub link
- WHEN `saveSocialLinks` is called with a new GitHub URL
- THEN the existing GitHub link is updated with the new URL

#### Scenario: multiple platforms saved at once
- GIVEN a user with no social links
- WHEN `saveSocialLinks` is called with GitHub + LinkedIn + Twitter links
- THEN three rows are created, one per platform

### Requirement: Onboarding Controller Endpoint

The `OnboardingController` MUST expose a `POST /onboarding/step-social-links` endpoint that:
- Receives validated `SaveStepSocialLinksRequest` (FormRequest)
- Delegates to `OnboardingService::saveSocialLinks()`
- Redirects to the next onboarding step (avatar) on success

#### Scenario: successful save redirects to next step
- GIVEN valid social link data submitted
- WHEN the endpoint processes the request
- THEN links are saved and user is redirected to the avatar step

#### Scenario: validation error returns to form
- GIVEN invalid URL data submitted
- WHEN the endpoint processes the request
- THEN validation errors are returned and user stays on the social links step

### Requirement: Onboarding Step UI

The onboarding flow MUST include a social links step (step 2.5) positioned between the bio step and the avatar step. The total step count MUST be 5.

The UI MUST display:
- Platform icons (inline SVG) for GitHub, LinkedIn, Twitter, Website
- URL input field per platform
- Inline validation feedback per input
- A "Skip" option (social links are optional during onboarding)
- A preview section showing how saved links will appear as clickable badges

#### Scenario: user sees all 4 platform inputs
- GIVEN user navigates to social links step
- THEN they see 4 rows: GitHub, LinkedIn, Twitter, Website each with icon + URL input

#### Scenario: user skips social links
- GIVEN user clicks "Skip" on social links step
- THEN they proceed to the avatar step without saving any links

#### Scenario: inline validation shows error
- GIVEN user types "not-a-url" in GitHub field
- THEN an inline error message appears below that input

#### Scenario: preview shows saved links
- GIVEN user enters valid URLs for GitHub and LinkedIn
- THEN a preview section below displays clickable badges with platform icons

### Requirement: Step Renumbering

The existing onboarding steps MUST be renumbered:
- Steps 1 (techs) and 2 (bio) remain unchanged
- New step 2.5 (social links) is inserted after bio
- Former step 3 (avatar) becomes step 4
- Former step 4 (recommendations) becomes step 5
- `totalSteps` MUST be updated from 4 to 5

#### Scenario: onboarding shows 5 total steps
- GIVEN user starts onboarding
- THEN `totalSteps` equals 5

#### Scenario: avatar step is now step 4
- GIVEN user completes social links step
- THEN the next step displayed is avatar (step 4)
