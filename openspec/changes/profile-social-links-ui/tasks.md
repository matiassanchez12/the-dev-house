# Tasks: Profile Social Links UI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~280-350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Icon registry + types + backend wiring + edit form + display + tests | Single PR | All scopes fit under 400 lines |

## Phase 1: Foundation (Types + Icon Registry)

- [ ] 1.1 Expand `Platform` type in `resources/js/types/index.ts` to include `youtube`, `discord`, `stackoverflow` alongside existing `github`, `linkedin`, `twitter`, `website`
- [ ] 1.2 Add `id?: number` and `_destroy?: boolean` fields to `SocialLink` interface in `resources/js/types/index.ts`
- [ ] 1.3 Add `socialLinks?: SocialLink[]` to `UserProfile` interface in `resources/js/types/index.ts`
- [ ] 1.4 Create `resources/js/lib/social-icons.ts` extracting SVG icons from onboarding (github, linkedin, twitter, website) plus new icons (youtube, discord, stackoverflow)
- [ ] 1.5 Export `getSocialIcon(slug: string): React.ReactNode`, `getSocialLabel(slug: string): string`, `SOCIAL_PLATFORMS: { slug: string; label: string }[]` from icon registry
- [ ] 1.6 Include generic fallback icon in `getSocialIcon()` and capitalized slug in `getSocialLabel()` for unknown platforms

## Phase 2: Backend Wiring (Controllers + Service + Routes)

- [ ] 2.1 Add `socialLinks` relationship eager load to `ProfileController@edit()` Inertia props via `$user->socialLinks`
- [ ] 2.2 Add `socialLinks` to `UserService::getPublicProfile()` return array via `$user->socialLinks`
- [ ] 2.3 Add `PUT /profile/social-links` route in `routes/web.php` pointing to `ProfileController@updateSocialLinks`
- [ ] 2.4 Create `ProfileController@updateSocialLinks()` method: validate `links` array, sync via `SocialLink` model (create new, update existing, delete removed)
- [ ] 2.5 Create `UpdateSocialLinksRequest` FormRequest with validation: `links.*.platform` in platforms array, `links.*.url` nullable URL format

## Phase 3: Edit Form Component

- [ ] 3.1 Create `resources/js/pages/profile/partials/social-links-edit-form.tsx` with props `{ socialLinks: SocialLink[]; className?: string }`
- [ ] 3.2 Implement dynamic rows: platform dropdown (from `SOCIAL_PLATFORMS`), URL input, remove button (only for saved links with `id`)
- [ ] 3.3 Use Inertia `useForm` with `links` array; "Add link" button pushes empty row `{ platform: '', url: '' }`
- [ ] 3.4 Remove button: for saved links, send individual `DELETE /profile/social-links/{id}`; for unsaved rows, remove from local state
- [ ] 3.5 Save button: `PUT /profile/social-links` with remaining links array; show success toast on completion
- [ ] 3.6 Gate component: return null if `socialLinks` prop is undefined (dependency not ready)

## Phase 4: Display Component

- [ ] 4.1 Create `resources/js/components/user/social-links-row.tsx` with props `{ links: SocialLink[] }`
- [ ] 4.2 Render horizontal row (`gap-3`) of anchor tags with SVG icons from `getSocialIcon()`, `size-5` icons
- [ ] 4.3 Each link: `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="{Platform} profile"`, `hover:text-primary hover:scale-110 transition-colors`
- [ ] 4.4 Return `null` if `links` array is empty
- [ ] 4.5 Update `UserProfileHeader` to accept `socialLinks?: SocialLink[]` prop, render `SocialLinksRow` below bio
- [ ] 4.6 Update `users/show.tsx` to pass `user.socialLinks` to `UserProfileHeader`

## Phase 5: Edit Page Integration

- [ ] 5.1 Import `SocialLinksEditForm` in `resources/js/pages/profile/edit.tsx`
- [ ] 5.2 Add `socialLinks` to Edit component props type
- [ ] 5.3 Add "Redes sociales" section card (same `bg-card p-4 shadow sm:rounded-lg sm:p-8` styling) with conditional render: only if `socialLinks` prop exists
- [ ] 5.4 Refactor Edit component to use explicit TypeScript interface for props

## Phase 6: Testing

- [ ] 6.1 Create `tests/Feature/SocialLinksProfileTest.php` with `RefreshDatabase`
- [ ] 6.2 Test: `GET /profile` includes `socialLinks` in Inertia props for authenticated user
- [ ] 6.3 Test: `PUT /profile/social-links` creates new links, validates platform and URL format
- [ ] 6.4 Test: `PUT /profile/social-links` updates existing link URL
- [ ] 6.5 Test: `DELETE /profile/social-links/{id}` removes a single link
- [ ] 6.6 Test: `GET /users/{slug}` includes `socialLinks` in user profile data
- [ ] 6.7 Test: public profile renders correctly when user has no social links (empty array)
- [ ] 6.8 Test: unauthenticated user cannot access `PUT /profile/social-links` (401/redirect)
