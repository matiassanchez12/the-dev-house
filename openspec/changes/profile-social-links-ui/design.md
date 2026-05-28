# Design: Profile Social Links UI

## Technical Approach

Add UI for managing and displaying social media links on user profiles. The backend `social_links` table and `SocialLink` model are created by the `social-links-onboarding` SDD (dependency). This change is purely frontend + controller prop wiring: a shared icon registry, an edit form with dynamic rows on `/profile/edit`, and a read-only display row on `/users/{slug}`.

## Architecture Decisions

### Decision: Icon registry location

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `resources/js/lib/social-icons.ts` | Matches spec, aligns with existing `lib/utils.ts` | **Chosen** |
| `resources/js/components/social-icons.ts` | Groups with UI components | Rejected — registry is data, not a component |

**Rationale**: The spec mandates `resources/js/lib/social-icons.ts`. The file exports pure functions and a constant array — it belongs in `lib/`, not `components/`.

### Decision: Form submission strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single bulk submit (POST with all changes) | One request, simpler UX, needs `_destroy` markers | **Chosen** |
| Per-row CRUD (POST/PUT/DELETE per action) | More requests, immediate feedback | Rejected — over-engineering for this scope |

**Rationale**: Matches existing profile patterns (`updateComplete` submits all techs at once). Uses `_destroy` boolean marker on deleted links — standard Laravel pattern for nested model updates.

### Decision: Component placement

| Component | Path | Rationale |
|-----------|------|-----------|
| Icon registry | `resources/js/lib/social-icons.ts` | Pure data, shared by edit + display |
| Edit form | `resources/js/pages/profile/partials/social-links-form.tsx` | Follows existing partials convention |
| Display row | `resources/js/components/user/social-links-row.tsx` | Public profile component, matches `user/` namespace |

## Data Flow

```
Edit Flow:
  ProfileController@edit()
    └─→ Inertia props: { socialLinks: SocialLink[] }
         └─→ profile/edit.tsx
              └─→ SocialLinksForm (partials/)
                   └─→ useForm({ links: [...] })
                        └─→ POST route('social-links.update')
                             └─→ SocialLinkController@update() [from onboarding SDD]

Display Flow:
  UserController@show()
    └─→ UserService.getPublicProfile()
         └─→ includes socialLinks in array
              └─→ Inertia props: { user: UserProfile }
                   └─→ users/show.tsx
                        └─→ UserProfileHeader
                             └─→ SocialLinksRow (components/user/)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `resources/js/lib/social-icons.ts` | Create | Icon registry: `getSocialIcon()`, `getSocialLabel()`, `SOCIAL_PLATFORMS` constant |
| `resources/js/pages/profile/partials/social-links-form.tsx` | Create | Edit form with dynamic rows, platform selector, URL input, bulk submit |
| `resources/js/components/user/social-links-row.tsx` | Create | Read-only icon row for public profile display |
| `resources/js/types/index.ts` | Modify | Add `SocialLink` interface, extend `UserProfile` with `socialLinks?` |
| `resources/js/pages/profile/edit.tsx` | Modify | Add social links section card, pass `socialLinks` prop |
| `resources/js/pages/users/show.tsx` | Modify | Pass `user.socialLinks` to `UserProfileHeader` |
| `resources/js/components/user/user-profile-header.tsx` | Modify | Accept `socialLinks?` prop, render `SocialLinksRow` below bio |
| `app/Http/Controllers/ProfileController.php` | Modify | Add `socialLinks` to `edit()` Inertia props |
| `app/Services/UserService.php` | Modify | Include `socialLinks` in `getPublicProfile()` return array |

## Interfaces / Contracts

### TypeScript Types (`resources/js/types/index.ts`)

```typescript
export interface SocialLink {
    id?: number;
    platform: string;
    url: string;
    _destroy?: boolean;
}

// Extend UserProfile
export interface UserProfile {
    // ... existing fields ...
    socialLinks?: SocialLink[];
}
```

### Icon Registry (`resources/js/lib/social-icons.ts`)

```typescript
export interface SocialPlatform {
    slug: string;
    label: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[];
export function getSocialIcon(slug: string): React.ReactNode;
export function getSocialLabel(slug: string): string;
```

Supported platforms: `github`, `linkedin`, `twitter`, `youtube`, `website`, `discord`, `stackoverflow`.

### Edit Form Props

```typescript
interface SocialLinksFormProps {
    socialLinks: SocialLink[];
    className?: string;
}
```

### Display Row Props

```typescript
interface SocialLinksRowProps {
    links: SocialLink[];
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getSocialIcon()` returns correct SVG for each platform | Vitest: iterate `SOCIAL_PLATFORMS`, assert non-null React node |
| Unit | `getSocialLabel()` returns correct label | Vitest: assert exact string match for each platform |
| Unit | `getSocialIcon()` fallback for unknown slug | Vitest: assert generic icon returned |
| Component | `SocialLinksRow` renders correct number of links | Vitest + RTL: mount with mock links, count anchors |
| Component | `SocialLinksRow` returns null for empty array | Vitest + RTL: assert `container.innerHTML === ''` |
| Component | `SocialLinksRow` links have `rel="noopener noreferrer"` | Vitest + RTL: query anchors, assert rel attribute |
| Component | `SocialLinksForm` adds new row on button click | Vitest + RTL: click "Add link", assert new row appears |
| Component | `SocialLinksForm` marks row for deletion | Vitest + RTL: click remove, assert `_destroy` in form data |
| Integration | ProfileController passes socialLinks to view | PHPUnit: assert Inertia response contains socialLinks prop |
| Integration | UserService includes socialLinks in profile data | PHPUnit: assert array contains socialLinks key |

## Migration / Rollout

No migration required. UI is gated behind `socialLinks` prop — renders nothing if undefined. Safe to deploy before or after `social-links-onboarding` SDD.

## Open Questions

- [ ] Confirm the route name for social links update endpoint (expected: `social-links.update` from onboarding SDD)
- [ ] Confirm if `SocialLinkController@update()` accepts bulk `_destroy` pattern or needs separate DELETE requests
