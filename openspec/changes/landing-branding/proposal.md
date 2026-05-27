# Proposal: Rebrand to The Dev House and inject landing page personality

## Intent

The landing page is functional but generic — no distinctive branding, fake stats, dead code (`welcome.tsx`), and the default Laravel SVG logo in the auth flow. The platform name is inconsistently "DevCollab" across files while the `.env` says "Dev Collab Platform". This change establishes a cohesive brand identity ("The Dev House") and injects personality into the landing and auth experience.

## Scope

### In Scope
- Rebrand all "DevCollab" / "Dev Collab" references → "The Dev House"
- Create custom SVG logo/brand mark (geometric code-bracket design)
- Landing page: sticky nav, animated hero background, scroll-triggered animations, new sections (How It Works, manifesto, social proof)
- Replace fake stats with real counts from DB (small controller change)
- Branded GuestLayout with new logo + tagline for auth pages
- Remove dead `welcome.tsx` and update route
- Update `.env` APP_NAME

### Out of Scope
- Database schema changes
- New API endpoints or authentication logic
- Email/notification changes
- Admin panel or dashboard changes

## Capabilities

### New Capabilities
- `landing-branding`: Landing page visual identity, branding consistency, and personality features including sticky navigation, animated hero, scroll animations, real stats display, new content sections, branded auth layout, and dead code removal.

### Modified Capabilities
- None — no existing spec requirements change at the behavioral level.

## Approach

1. **Brand sweep**: Find-and-replace all "DevCollab" / "Dev Collab" references across landing, onboarding, config, and env files
2. **Logo**: Create inline SVG component (`brand-logo.tsx`) with geometric code-bracket mark — no external assets
3. **Landing redesign**: Refactor `landing.tsx` with sticky nav, gradient mesh hero (CSS animation), IntersectionObserver-based scroll animations, and three new sections
4. **Real stats**: Add `LandingController` that passes `User::count()`, `Project::count()`, etc. to the Inertia view; remove hardcoded fake numbers
5. **GuestLayout**: Replace Laravel SVG with `BrandLogo` component, add tagline subtitle
6. **Cleanup**: Delete `welcome.tsx`, remove its route, update `.env`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `resources/js/pages/landing.tsx` | Modified | Full redesign: sticky nav, hero animation, new sections, scroll animations |
| `resources/js/components/brand-logo.tsx` | New | Custom SVG logo component |
| `resources/js/layouts/guest-layout.tsx` | Modified | Replace Laravel SVG with BrandLogo |
| `resources/js/pages/welcome.tsx` | Removed | Dead Breeze page |
| `routes/web.php` | Modified | Remove welcome route, add landing controller route |
| `app/Http/Controllers/LandingController.php` | New | Pass real DB counts to landing page |
| `.env` | Modified | APP_NAME → "The Dev House" |
| `resources/js/pages/auth/*.tsx` | Modified | Minor: brand name text updates in onboarding/complete-profile |
| `resources/views/app.blade.php` | Modified | Page title meta tag |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CSS animations impact performance on low-end devices | Low | Use `will-change` sparingly, prefer CSS transforms over layout properties |
| Landing page refactor introduces regressions | Medium | TDD approach — write feature tests for LandingController before implementation |
| Brand name inconsistency missed in some files | Low | Use `rg -i "dev.?collab"` to audit before commit |

## Rollback Plan

1. `git revert` the change branch — all modifications are additive or replace existing files
2. Restore `welcome.tsx` from git history if needed: `git checkout HEAD~1 -- resources/js/pages/welcome.tsx`
3. Revert `.env` APP_NAME change manually
4. No data migration to roll back

## Dependencies

- None — pure frontend + one new controller with existing Eloquent models

## Success Criteria

- [ ] Zero "DevCollab" or "Dev Collab" references remain in the codebase
- [ ] `welcome.tsx` deleted and route removed — no 404 on `/`
- [ ] Landing page displays real user/project counts from DB
- [ ] Brand logo renders on landing nav, auth pages, and browser tab
- [ ] Scroll animations trigger correctly on section entry (IntersectionObserver)
- [ ] `npm run build` succeeds with zero errors
- [ ] `php artisan test` passes all existing tests
