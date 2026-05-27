# Proposal: Profile Social Links UI

## Intent

Allow users to manage and display social media links (GitHub, LinkedIn, Twitter/X, Portfolio, etc.) on their profile. The backend `social_links` table exists (from `social-links-onboarding` SDD). This change adds the UI for editing links on `/profile/edit` and displaying them on the public profile `/users/{slug}`.

## Scope

### In Scope
- **Profile edit** (`/profile/edit`): Section to add/edit/remove social links with platform selector + URL input
- **Public profile** (`/users/{slug}`): Social links row with platform-specific SVG icons, hover effects
- **Validation**: Only render links where URL is non-empty; graceful empty state
- **Shared icon registry**: Reusable SVG icon map for all supported platforms
- **TypeScript types**: `SocialLink` interface + extend `UserProfile` and page props

### Out of Scope
- Backend CRUD endpoints (handled by `social-links-onboarding` SDD)
- Social link validation on backend (handled by `social-links-onboarding` SDD)
- OAuth connection to social platforms
- Link preview / OpenGraph cards

## Capabilities

### New Capabilities
- `social-links-edit-ui`: Add/edit/remove social links on profile edit page with platform selector and URL input
- `social-links-display-ui`: Display social links with platform icons on public profile page

### Modified Capabilities
- None — `user-profile` spec is modified at the data level (new `socialLinks` field), not at requirement level. Delta spec will extend the `UserProfile` type.

## Approach

1. **Shared icon registry** (`resources/js/lib/social-icons.ts`): Map platform slugs to inline SVG icons (GitHub, LinkedIn, Twitter/X, YouTube, Portfolio, Discord, StackOverflow). Same icons used by onboarding and profile UI.
2. **Edit UI** (`resources/js/components/profile/social-links-form.tsx`): Reusable form component with platform dropdown + URL input + remove button. Add/remove rows dynamically. Posts to existing social-links endpoints.
3. **Display UI** (`resources/js/components/user/social-links-row.tsx`): Horizontal row of icon links with hover effects (`hover:text-primary`, `transition-colors`). Only shows platforms with configured URLs.
4. **Integrate**: Add `SocialLinksForm` to `profile/edit.tsx`. Add `SocialLinksRow` to `user-profile-header.tsx` or below it.
5. **Types**: Add `SocialLink` interface, extend `UserProfile` with `socialLinks` array.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/lib/social-icons.ts` | New | Platform slug → SVG icon map + platform labels |
| `resources/js/components/profile/social-links-form.tsx` | New | Edit form with dynamic rows |
| `resources/js/components/user/social-links-row.tsx` | New | Public display with icon links |
| `resources/js/pages/profile/edit.tsx` | Modified | Add social links section |
| `resources/js/pages/users/show.tsx` | Modified | Pass socialLinks to header |
| `resources/js/components/user/user-profile-header.tsx` | Modified | Render social links row |
| `resources/js/types/index.ts` | Modified | Add `SocialLink` interface, extend `UserProfile` |
| `app/Http/Controllers/UserController.php` | Modified | Include socialLinks in show() data |
| `app/Http/Controllers/ProfileController.php` | Modified | Include socialLinks in edit() data |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Social links endpoints not ready (dependency not merged) | Medium | Gate UI behind `socialLinks` prop; render nothing if absent |
| Too many platforms clutter the UI | Low | Cap visible platforms; use dropdown for "more" if >6 |
| SVG icons increase bundle size | Low | Inline SVGs are tiny (<2KB total); no external dependency |

## Rollback Plan

1. Remove `social-links-form.tsx` and `social-links-row.tsx` components
2. Remove `social-icons.ts` registry
3. Revert changes to `edit.tsx`, `show.tsx`, `user-profile-header.tsx`
4. Remove `socialLinks` from TypeScript types
5. No database changes — backend table remains intact for future use

## Dependencies

- `social-links-onboarding` SDD: Must provide `social_links` table, model, and CRUD endpoints
- Platform icon SVGs: Inline, no external library needed

## Success Criteria

- [ ] User can add/edit/remove social links on `/profile/edit`
- [ ] Public profile shows social link icons with correct platform branding
- [ ] Only platforms with configured URLs are displayed
- [ ] Hover effects on icons (color change, subtle scale)
- [ ] Empty state: no section rendered when user has no social links
- [ ] `php artisan test --filter=SocialLinksUiTest` passes
