# Archive Report: Social Links Onboarding

**Change**: `social-links-onboarding`
**Archived**: 2026-05-27
**Archive Path**: `openspec/changes/archive/2026-05-27-social-links-onboarding/`

---

## Executive Summary

Added social media links (GitHub, LinkedIn, Twitter, Website) as a new onboarding step between bio and avatar. The onboarding flow now has 5 steps: techs → bio → social-links → avatar → recommendations. Delivered a complete backend (migration, model, FormRequest, service, controller, route) and frontend (React step with inline SVG icons, URL inputs, validation, preview). All 17 tasks implemented, 4 verification warnings fixed, 18 tests passing with 52 assertions.

---

## Files Changed

### Created (5 files)
| File | Description |
|------|-------------|
| `database/migrations/2026_05_28_001944_create_social_links_table.php` | Migration: `social_links` table with `user_id`, `platform` enum, `url`, unique composite index |
| `app/Models/SocialLink.php` | Eloquent model with `fillable`, `HasFactory`, `belongsTo(User)` |
| `app/Http/Requests/Onboarding/SaveStepSocialLinksRequest.php` | FormRequest: validates `links` array with platform + URL rules |
| `openspec/specs/social-links/spec.md` | Main spec for social links domain (copied from delta) |

### Modified (6 files)
| File | Description |
|------|-------------|
| `app/Models/User.php` | Added `socialLinks()` hasMany relationship |
| `app/Services/OnboardingService.php` | Added `saveSocialLinks(User, array): void` with upsert strategy |
| `app/Http/Controllers/OnboardingController.php` | Added `saveStepSocialLinks()` method, updated `totalSteps` Inertia prop |
| `routes/web.php` | Added `POST /onboarding/step-social-links` route |
| `resources/js/types/index.ts` | Added `Platform` type and `SocialLink` interface |
| `resources/js/pages/onboarding/index.tsx` | Added step 3 UI (social links), renumbered steps 3→4, 4→5, `totalSteps` 5 |

### Tests (1 file)
| File | Description |
|------|-------------|
| `tests/Feature/OnboardingTest.php` | Added 7 new tests + 3 warning-fix tests = 10 new test methods |

---

## Test Coverage Summary

| Metric | Value |
|--------|-------|
| Tests added | 10 |
| Total tests passing | 18 |
| Assertions | 52 |
| Coverage areas | Model, Service, Controller, Route, Validation, Cascade Delete, Step Count |

### Tests Added
1. `test_user_can_complete_step_social_links` — valid data saves and redirects
2. `test_social_links_invalid_url_rejected` — invalid URL returns validation error
3. `test_social_links_invalid_platform_rejected` — unknown platform rejected
4. `test_social_links_empty_array_rejected` — empty links array fails
5. `test_social_links_upsert_updates_existing` — duplicate platform updates, no new row
6. `test_social_links_cascade_delete` — user deletion removes social_links
7. `test_onboarding_total_steps_is_five` — onboarding renders with 5 steps
8. `test_social_links_url_max_length` — URL > 2048 chars rejected (warning fix)
9. `test_social_link_belongs_to_user` — model relationship resolves (warning fix)
10. `test_social_links_inline_validation_errors_displayed` — frontend shows errors (warning fix)

---

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `app` | Updated | 3 added requirements (OnboardingService method, Controller endpoint, FormRequest), 1 modified (Onboarding Flow Steps: 4→5) |
| `social-links` | Created | New domain spec with 7 requirements (Data Model, Model, Validation, Service, Controller, UI, Step Renumbering) |

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Step numbering | Display step 3, internal position after bio | Clean UX, minimal churn |
| Upsert strategy | `SocialLink::upsert()` batch | Single query, avoids N+1 |
| Route naming | `/onboarding/step-social-links` | Semantic, consistent pattern |
| Platform icons | Inline SVG components | Zero dependencies, matches proposal |
| Frontend placement | Inline in `index.tsx` | Follows existing monolithic pattern |

---

## Key Learnings

- **Inertia + FormRequest**: Validation errors return 302 redirect with session errors, not 422. Use `assertSessionHasErrors()` instead of `assertStatus(422)`.
- **Frontend error display**: `InputError` component must be imported and errors extracted from `usePage().props.errors` for inline display per input.
- **totalSteps testing**: Must be passed as Inertia prop from server-side to be testable.

---

## Technical Debt / Follow-ups

| Item | Priority | Notes |
|------|----------|-------|
| Social links editing outside onboarding | Medium | Planned in `profile-social-links-ui` SDD (dependency) |
| Social links on public profile page | Low | Future change, UI not yet defined |
| `onboarding/index.tsx` file size | Low | Monolithic pattern — consider extraction when file grows beyond maintainability |

---

## Dependent Changes

The following SDD change depends on this archive:

- **`profile-social-links-ui`** — Adds UI for managing social links on `/profile/edit` and displaying them on public profiles. Backend (`social_links` table, `SocialLink` model, `OnboardingService::saveSocialLinks`) is already provided by this change.

---

## Engram Observation IDs

| Artifact | Observation ID |
|----------|---------------|
| proposal | Not persisted in Engram (filesystem only) |
| spec | #358 |
| design | #360 |
| tasks | Not persisted in Engram (filesystem only) |
| apply-progress | #364 |
| verify-report / warnings fix | #365 |

---

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived. Delta specs merged into main specs. Source of truth updated:
- `openspec/specs/app/spec.md` — onboarding requirements added
- `openspec/specs/social-links/spec.md` — new domain spec created

Ready for the next change.
