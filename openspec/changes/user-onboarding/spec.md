# Delta for user-onboarding

## ADDED Requirements

### Requirement: onboarding-wizard-route

`GET /onboarding` MUST return JSON with:
- `currentStep`: integer 1–4 (based on completed steps, default 1)
- `user`: object with `bio` and `avatar`
- `selectedTechs`: array of user's techs with proficiency already selected
- `allTechs`: full list of techs from database
- `step`: 1 | 2 | 3 | 4
- `onboardingCompleted`: boolean derived from `user.onboarding_completed_at != null`

If `onboarding_completed_at` is set, the server MUST redirect to `/dashboard`.

#### Scenario: GET /onboarding returns step data for incomplete user

- GIVEN: authenticated user without `onboarding_completed_at`
- WHEN: GET /onboarding is called
- THEN: returns `{ currentStep: 1, user: { bio, avatar }, selectedTechs: [...], allTechs: [...], step: 1, onboardingCompleted: false }`

#### Scenario: Redirect when already completed

- GIVEN: authenticated user with `onboarding_completed_at` set
- WHEN: GET /onboarding is called
- THEN: redirects to /dashboard (HTTP 302)

### Requirement: onboarding-controller

`OnboardingController` MUST provide:

- `index()` — `GET /onboarding`, returns step data
- `saveStep1(Request $request)` — `POST /onboarding/step-1`, saves techs (syncs `user_tech` pivot with proficiency)
- `saveStep2(Request $request)` — `POST /onboarding/step-2`, saves bio
- `saveStep3(Request $request)` — `POST /onboarding/step-3`, handles avatar file upload
- `saveStep4(Request $request)` — `POST /onboarding/step-4`, processes bookmarks and join requests
- `skip()` — `POST /onboarding/skip`, sets `onboarding_completed_at = now()`
- `recommendations()` — `GET /onboarding/recommendations`, returns 3–5 projects matching user's selected techs

#### Scenario: Step 1 saves tech proficiency

- GIVEN: authenticated user
- WHEN: POST /onboarding/step-1 with `{ techs: [{id: 1, proficiency: 3}, {id: 2, proficiency: 5}] }`
- THEN: user has 2 techs in `user_tech` pivot with correct proficiency values

#### Scenario: Step 2 saves bio

- GIVEN: authenticated user
- WHEN: POST /onboarding/step-2 with `{ bio: "Mi bio" }`
- THEN: user.bio == "Mi bio"

#### Scenario: Step 3 handles avatar upload

- GIVEN: authenticated user
- WHEN: POST /onboarding/step-3 with avatar file
- THEN: user.avatar is set to the stored file path

#### Scenario: Step 4 creates join request

- GIVEN: authenticated user and project id
- WHEN: POST /onboarding/step-4 with `{ joinRequests: [projectId] }`
- THEN: JoinRequest exists for user and project with status `pending`

#### Scenario: Skip sets completion flag

- GIVEN: authenticated user at any step
- WHEN: POST /onboarding/skip
- THEN: user.onboarding_completed_at is set to current timestamp

### Requirement: step-1-tech-selection

Step 1 display MUST:
- Render all available techs in a 2–3 column grid
- Each tech shows: name, optional icon, checkbox for selection
- When selected, show proficiency slider (1–5): Principiante, Básico, Intermedio, Avanzado, Experto
- Minimum 0 techs required (can skip)

On save, MUST sync to `user_tech` pivot with `proficiency`.

### Requirement: step-2-bio

Step 2 display MUST:
- Textarea for bio (max 500 characters)
- Live character count display
- Placeholder: "Contá sobre vos, tu experiencia y qué te gustaría construir..."
- Can skip (bio remains empty)

### Requirement: step-3-avatar

Step 3 display MUST:
- File input (accept: image/*)
- Preview of current avatar (if any) or placeholder
- Max 2MB, jpg/png/webp validation
- On save: store file, update `users.avatar`
- Can skip (no avatar)

### Requirement: step-4-project-recommendations

Step 4 display MUST:
- Show 3–5 projects matching at least 1 of user's selected techs
- Project cards show: title, truncated description (max 2 lines), tech badges, creator name
- Highlight matching tech badges
- Two button actions per card: "Guardar" and "Enviar solicitud"
- Skip allowed

### Requirement: onboarding-completed-flag

When user completes all steps OR skips, the system MUST:
- Set `users.onboarding_completed_at = now()`
- Redirect to `/dashboard`

### Requirement: onboarding-recommendations-endpoint

`GET /onboarding/recommendations` MUST return 3–5 projects where:
- Project has at least 1 tech matching user's selected techs
- Results ordered by relevance (more matching techs = higher priority)

#### Scenario: Recommendations returns matching projects

- GIVEN: user has selected techs [React, Laravel]
- WHEN: GET /onboarding/recommendations is called
- THEN: returns projects that have React OR Laravel (max 5)

### Requirement: onboarding-layout

The onboarding view MUST use a centered layout with:
- Max-width container for readability
- Progress indicator: "Step X of 4"
- Title for current step
- Back/Next/Skip buttons in footer
- No sidebar or navigation

### Requirement: project-card-for-onboarding

`OnboardingProjectCard` component MUST:
- Accept props: `project` (with techs, creator), `userTechs` (array of tech names user selected)
- Display: title, truncated description (2 lines max), matching tech badges (highlighted), creator name
- Action buttons: "Guardar" (bookmarks to session), "Enviar solicitud" (creates join request immediately)

### Requirement: onboarding-isprofilecomplete-flag

The dashboard service MUST add `isProfileComplete` (boolean) to dashboard data derived from `onboarding_completed_at != null`.

This supersedes the computed `isProfileComplete()` method for the onboarding flow.

#### Scenario: Profile complete after onboarding

- GIVEN: user with `onboarding_completed_at` set
- WHEN: dashboard loads
- THEN: `isProfileComplete` flag is true

#### Scenario: Profile incomplete before onboarding

- GIVEN: user with `onboarding_completed_at` null
- WHEN: dashboard loads
- THEN: `isProfileComplete` flag is false

## MODIFIED Requirements

### Requirement: DashboardService Requirements

`getDashboardData` MUST return all 5 keys plus `isProfileComplete` from `onboarding_completed_at`.
(Previously: returned only the 5 keys without isProfileComplete)

#### Scenario: getDashboardData includes isProfileComplete

- GIVEN: a User with `onboarding_completed_at` set
- WHEN: `getDashboardData($user)` is called
- THEN: returns `['stats', 'createdProjects', 'participatingProjects', 'pendingRequests', 'sentRequests', 'isProfileComplete' => true]`
