# Exploration: profile-privacy-ui (Scope A)

## Current State

The `/profile/edit` page (`resources/js/pages/profile/edit.tsx`) renders a vertical stack of independent form sections, each in its own card:

1. **Basic info** — `UpdateProfileInformationForm` (name, email) → `PATCH /profile`
2. **Complete profile** — `UpdateProfileCompleteForm` (bio, avatar, techs) → `POST /profile/complete`
3. **Social links** — `SocialLinksEditForm` → `PUT /profile/social-links`
4. **Password**
5. **Delete account**

The backend `ProfileController::edit()` already injects two props that the frontend currently ignores:
- `phone: string | null` — lives on the `users` table
- `privacySetting: UserPrivacySetting` — object with `show_email`, `show_phone`, `is_discoverable`, `show_activity` booleans

The `POST /profile/privacy` route (`profile.privacy.update`) and `UpdatePrivacyRequest` validation are fully wired. The request accepts `phone`, `show_email`, `show_phone`, `is_discoverable`, `show_activity`.

## Affected Areas

| File | Why affected |
|------|-------------|
| `resources/js/pages/profile/edit.tsx` | Must receive and forward `phone` and `privacySetting` props to new form partial |
| `resources/js/pages/profile/partials/update-privacy-form.tsx` | **New component** — phone input + 4 privacy toggles, submits to `POST /profile/privacy` |
| `resources/js/types/index.ts` | Add `PrivacySetting` interface (or augment `User`) so TypeScript knows the shape |
| `resources/js/pages/profile/partials/update-privacy-form.test.tsx` | **New test** — wiring, toggle interaction, submission, error display |

## Component & Form Strategy

- **Form library**: Inertia `useForm` (already used in every existing profile partial).
- **Submit verb**: `post` to `route('profile.privacy.update')` because the endpoint is `POST` (not `PATCH`).
- **UI controls**:
  - Phone: reuse existing `<Input type="tel">` inside `<Field>`.
  - Privacy toggles: project has `<Checkbox>` (`@base-ui/react/checkbox`) but **no `<Switch>`** component. For binary on/off settings the existing Checkbox is the pragmatic choice. If UX wants a switch, we would need to add a new UI primitive (out of scope for this narrow slice).
- **Section placement**: Insert after *Complete profile* and before *Social links* — contact/privacy is logically adjacent to personal info and separate from social presence.
- **Helper copy**: Each toggle should have a short explanation of what becomes public (e.g. *"Si activás esta opción, otros usuarios podrán ver tu email en tu perfil público"*). Keep copy in Spanish to match the rest of the profile UI.

## UX / Dependency Constraints

| Constraint | Impact |
|-----------|--------|
| No `<Switch>` in UI kit | Use `<Checkbox>` for toggles; adding Switch would expand scope beyond UI slice |
| `phone` is nullable and optional | Input must accept empty string and map to `null` on submit; backend already strips empty strings to `null` in `UpdatePrivacyRequest::prepareForValidation()` |
| Privacy-first defaults | `show_email=false`, `show_phone=false` by default — UI must reflect these booleans correctly on first load |
| One form per section pattern | Phone + privacy MUST live in the same form because the backend endpoint updates both atomically in a DB transaction. We cannot split them across two cards without backend changes. |
| No Redux / Zustand | Local `useForm` state only — consistent with existing profile partials |
| Max 400 review lines | Keep the new component under ~100 lines; extract helper copy map if needed |

## Approaches

### Option A: Single new partial — `UpdatePrivacyForm`
Create one component that contains phone input + privacy toggles + submit button.

- **Pros**: Follows existing pattern (one card = one form = one endpoint). Minimal file changes. Easy to test in isolation.
- **Cons**: Phone feels slightly mis-categorized under "Privacy" since it is a contact field, not a visibility toggle. Acceptable given backend coupling.
- **Effort**: Low

### Option B: Separate phone into `UpdateProfileInformationForm`
Add phone to the existing basic-info form and keep privacy toggles in a separate form.

- **Pros**: Phone sits with name/email (more intuitive UX).
- **Cons**: Requires backend changes — `ProfileController::update()` does not accept `phone`, and `updatePrivacy()` would need to drop phone handling or the frontend would need two separate submissions for one logical action. Breaks atomicity.
- **Effort**: Medium-High (violates "backend changes out of scope" constraint)

### Option C: Custom hook + composition
Extract a `usePrivacyForm` hook and compose smaller toggle components.

- **Pros**: Reusable if privacy toggles appear elsewhere later.
- **Cons**: Over-engineering for a single screen with four booleans. Adds indirection for reviewers.
- **Effort**: Medium

## Recommendation

**Option A** — a single `UpdatePrivacyForm` partial. It respects the existing one-card-one-endpoint pattern, requires zero backend work, and keeps the review surface small.

## Risks

- **Checkbox vs Switch UX**: Users may expect switches for on/off privacy settings. If this becomes feedback, a future slice can add a `<Switch>` primitive and swap it in.
- **Type safety**: The `privacySetting` prop shape is not yet typed in `resources/js/types/index.ts`. We must add a `PrivacySetting` interface or inline it to keep TypeScript strict.
- **Test mocking**: `useForm` from `@inertiajs/react` must be mocked in tests the same way `update-profile-complete-form.test.tsx` already does.

## Ready for Proposal

**Yes.** The insertion point is clear, the backend contract is stable, and the scope is well bounded. The orchestrator should proceed to `sdd-propose`.

---

## Likely Files to Change (compact list)

1. `resources/js/pages/profile/edit.tsx`
2. `resources/js/pages/profile/partials/update-privacy-form.tsx` (new)
3. `resources/js/pages/profile/partials/update-privacy-form.test.tsx` (new)
4. `resources/js/types/index.ts`
