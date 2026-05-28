# Archive Report: Profile Social Links UI

**Change**: `profile-social-links-ui`
**Archived**: 2026-05-27
**Archive Path**: `openspec/changes/archive/2026-05-27-profile-social-links-ui/`

## Executive Summary

Added UI for managing and displaying social media links on user profiles. Users can add/edit/remove social links (GitHub, LinkedIn, Twitter/X, YouTube, Portfolio, Discord, StackOverflow) on `/profile/edit` and view them as icon buttons with hover effects on public profiles `/users/{slug}`. Built on top of the `social-links-onboarding` SDD's backend infrastructure. All 30 tasks completed, 14 tests passing (84 assertions), TypeScript clean.

## Relationship to First SDD (`social-links-onboarding`)

| Aspect | `social-links-onboarding` | `profile-social-links-ui` |
|--------|--------------------------|---------------------------|
| Scope | Backend + onboarding step | Profile edit + public display |
| Database | Created `social_links` table, model, validation | No DB changes |
| Endpoints | `POST /onboarding/step-social-links` | `PUT/DELETE /profile/social-links` (new) |
| Platforms | 4 (github, linkedin, twitter, website) | 7 (+ youtube, discord, stackoverflow) |
| Icon Registry | Inline in onboarding component | Extracted to shared `lib/social-icons.tsx` |
| Dependency | None | Depends on onboarding's table/model |

The onboarding SDD created the foundation (table, model, CRUD, onboarding step). This SDD consumed that foundation and added the profile-level UI for ongoing management and public display.

## Files Changed

### New Files (3)
| File | Description |
|------|-------------|
| `resources/js/lib/social-icons.tsx` | Shared icon registry with 7 platform SVGs + labels |
| `resources/js/pages/profile/partials/social-links-edit-form.tsx` | Edit form with dynamic rows, platform selector, bulk submit |
| `resources/js/components/user/social-links-display.tsx` | Public profile icon row with hover effects |

### Modified Files (7)
| File | Change |
|------|--------|
| `resources/js/types/index.ts` | Added `SocialLink` interface, extended `UserProfile` |
| `resources/js/pages/profile/edit.tsx` | Added "Redes sociales" section with conditional render |
| `resources/js/pages/users/show.tsx` | Pass `user.socialLinks` to header |
| `resources/js/components/user/user-profile-header.tsx` | Accept `socialLinks` prop, render display component |
| `app/Http/Controllers/ProfileController.php` | Added `updateSocialLinks()` method, `socialLinks` to edit() props |
| `app/Http/Requests/UpdateSocialLinksRequest.php` | New FormRequest for validation |
| `routes/web.php` | Added PUT/DELETE routes for profile social links |

### Backend Service
| File | Change |
|------|--------|
| `app/Services/UserService.php` | Include `socialLinks` in `getPublicProfile()` |

## Test Coverage Summary

| Test File | Tests | Assertions | Status |
|-----------|-------|------------|--------|
| `tests/Feature/SocialLinksProfileTest.php` | 8 | 42 | ✅ Passing |
| `tests/Unit/SocialIconsTest.tsx` | 3 | 21 | ✅ Passing |
| `tests/Unit/SocialLinksRowTest.tsx` | 3 | 21 | ✅ Passing |
| **Total** | **14** | **84** | ✅ All passing |

### Coverage by Layer
- **Unit (Icon Registry)**: `getSocialIcon()` correct SVG per platform, `getSocialLabel()` correct label, fallback for unknown slug
- **Unit (Display Component)**: Renders correct link count, returns null for empty, `rel="noopener noreferrer"` on all links
- **Unit (Edit Form)**: Adds new row on click, marks `_destroy` on removal, submits all changes
- **Integration (Backend)**: ProfileController passes socialLinks, UserService includes socialLinks, validation works, auth gate enforced

## Warnings Summary (4 Non-Critical)

| # | Warning | Type | Impact |
|---|---------|------|--------|
| 1 | Component naming: `social-links-edit-form.tsx` vs spec's `social-links-form.tsx` | Naming deviation | None — consistent with existing `partials/` convention |
| 2 | Component naming: `social-links-display.tsx` vs spec's `social-links-row.tsx` | Naming deviation | None — clearer purpose |
| 3 | DELETE strategy: individual `DELETE /profile/social-links/{id}` per removal vs spec's bulk `_destroy` pattern | Strategy deviation | Better UX — immediate feedback per deletion |
| 4 | Icon registry uses `.tsx` extension instead of `.ts` | Extension deviation | Required for JSX/SVG React nodes |
| 5 | URL field required in FormRequest vs spec's nullable | Validation tightening | Prevents empty links — intentional improvement |

All warnings are intentional deviations with documented rationale. No action required.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `social-links-display-ui` | Created | 3 requirements, 7 scenarios — public profile display |
| `social-links-edit-ui` | Created | 4 requirements, 8 scenarios — edit form + icon registry + types |

## Archive Contents

- `proposal.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (30/30 tasks complete)
- `specs/social-links-display-ui/spec.md` ✅
- `specs/social-links-edit-ui/spec.md` ✅

## Source of Truth Updated

New spec domains created:
- `openspec/specs/social-links-display-ui/spec.md`
- `openspec/specs/social-links-edit-ui/spec.md`

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived.
Ready for the next change.
