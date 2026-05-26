# Proposal: user-onboarding (Wizard)

## Intent

Improve new user experience with a guided 4-step onboarding wizard that captures profile data (techs, bio, avatar) and suggests relevant projects to join.

## Scope

### In Scope
- `GET /onboarding` — first-time users, no auth required to view
- 4-step wizard component with progress indicator (Step X of 4)
- **Step 1**: Tech selection (multi-select with proficiency slider per tech)
- **Step 2**: Bio editor (textarea, ~500 char limit, live count)
- **Step 3**: Avatar upload with preview before/after
- **Step 4**: Project recommendations (3–5 projects matching selected techs)
- Step 4 actions: "Guardar" (bookmark) or "Enviar solicitud" (send join request)
- Each step has **Skip** button; global "Skip All" option
- On completion or skip: set `onboarding_completed_at` → redirect to `/dashboard`

### Out of Scope
- Email verification flow (already exists)
- Profile enforcement before using features
- Full bookmarking system (beyond session)
- Full project discovery (recommendations only)

## Capabilities

### New Capabilities
- `onboarding-wizard`: 4-step guided onboarding flow with progress tracking and skip logic
- `tech-proficiency`: User selects techs with proficiency levels stored in `user_tech` pivot

### Modified Capabilities
- `user-profile`: Add `onboarding_completed_at` timestamp; bio, avatar_path already exist
- `project-recommendations`: Algorithm returning projects matching user's techs (max 5)

## Approach

1. **Backend**: 6 endpoints — `GET /onboarding` (return techs + user data), `POST /onboarding/step-{1-4}` for each step, `POST /onboarding/skip`, `GET /onboarding/recommendations` (project matching user's techs)
2. **Frontend**: React wizard component at `/onboarding` using Inertia for navigation between steps
3. **Data flow**: User registers → redirected to `/onboarding` → steps 1–4 → `onboarding_completed_at` set → redirect to `/dashboard`
4. **Step 4 recommendations**: Query projects with at least one tech matching user's selected techs, ordered by relevance, limit 5

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/Models/User.php` | Modified | Add `onboarding_completed_at` timestamp |
| `app/Http/Controllers/OnboardingController.php` | New | 6 endpoints (index, 4 steps, skip) |
| `app/Services/OnboardingService.php` | New | Tech sync, recommendations, completion |
| `app/Http/Requests/Onboarding/` | New | FormRequest per step |
| `resources/js/pages/onboarding/` | New | React wizard page + 4 step components |
| `routes/web.php` | Modified | Add onboarding routes |
| `database/migrations/*` | New | Add `onboarding_completed_at` to users |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| User skips all and profile stays incomplete | Medium | Dashboard continues to show subtle prompt |
| Recommendations are too generic | Medium | Require ≥2 matching techs for recommendation |
| Mobile wizard UX poor | Low | Test responsive layout; sticky navigation |

## Rollback Plan

1. Revert migration to drop `onboarding_completed_at` column
2. Delete `OnboardingController` and `OnboardingService`
3. Remove onboarding routes from `web.php`
4. Delete `resources/js/pages/onboarding/` directory
5. Clear any bookmarked projects from onboarding

## Dependencies

- ProfileService already has `syncTechs` and `updateAvatar`
- Existing `techs` table and `user_tech` pivot (with proficiency)

## Success Criteria

- [ ] `GET /onboarding` returns available techs and user's current progress
- [ ] Each step saves data and advances to next step
- [ ] Skip button on every step; "Skip All" marks `onboarding_completed_at`
- [ ] Step 4 shows 3–5 project recommendations matching user's techs
- [ ] "Guardar" creates bookmark; "Enviar solicitud" creates join request
- [ ] Completion redirects to `/dashboard`
- [ ] `php artisan test --filter=OnboardingTest` passes