## Exploration: profile-edit-shadcn-alignment

### Current State

The original exploration started as a narrow profile-page cleanup, but the current candidate is now a small reviewability bundle:

- **Profile scope-1 refactor** — `update-profile-information-form.tsx`, `update-password-form.tsx`, and `delete-user-form.tsx` now own their `Card` shell and `edit.tsx` removes duplicate page wrappers around those three sections.
- **Shared input plumbing** — `resources/js/components/ui/input.tsx` now forwards refs to the Base UI input primitive so the profile password/delete flows can keep their focus-on-error behavior without type or runtime drift.
- **Collateral landing fixes** — `resources/js/pages/landing.tsx` restores `LandingStats`, `hero-headline.tsx` restores the live trust badge copy, and `hero-wordmark.tsx` restores the visible wordmark/strapline. These are not a new feature scope; they are follow-up fixes so the landing tests and rendered hero copy match again.
- **Collateral backend verification fix** — `PublicMilestoneController.php` and `MilestonesTest.php` now document deterministic completed-first ordering even when databases sort `NULL` timestamps differently.

The remaining profile partials are still intentionally deferred:

- **`update-privacy-form`** — Uses `Field`, `Input`, `Checkbox`, `Button`, but keeps raw checkbox-row wrappers.
- **`update-notification-settings-form`** — Same raw checkbox-row pattern as privacy.
- **`update-profile-complete-form`** — Still mixes shadcn primitives with raw checkbox/range/details markup.
- **`social-links-edit-form`** — Still uses raw row wrappers around `Select` and `Input`.

**Installed UI primitives available**: `card`, `dialog`, `select`, `checkbox`, `badge`, `field`, `input`, `textarea`, `button`, `avatar`, `form-error`, `label`, `tabs`, `separator`.

**Missing primitives**: `slider`, `switch`, `toggle-group`, `accordion`, `FieldGroup`, `FieldSet`. This limits strict adherence to the shadcn form layout rules until those are added.

### Affected Areas

- `resources/js/pages/profile/edit.tsx` — Page wrapper uses raw divs instead of `Card`.
- `resources/js/pages/profile/partials/update-profile-information-form.tsx` — Scope-1 Card composition, gap layout, tests.
- `resources/js/pages/profile/partials/update-password-form.tsx` — Scope-1 Card composition, gap layout, tests.
- `resources/js/pages/profile/partials/update-privacy-form.tsx` — Needs composed checkbox rows, Card wrapper.
- `resources/js/pages/profile/partials/update-notification-settings-form.tsx` — Needs composed checkbox rows, Card wrapper.
- `resources/js/pages/profile/partials/update-profile-complete-form.tsx` — Needs shadcn Checkbox, Badge, Slider (if added), Card.
- `resources/js/pages/profile/partials/social-links-edit-form.tsx` — Needs `Field` wrappers, icon sizing fix, Card.
- `resources/js/pages/profile/partials/delete-user-form.tsx` — Scope-1 `DialogTitle`, Card, tests.
- `resources/js/components/ui/input.tsx` — Needs ref forwarding so scope-1 focus management keeps working through the shared wrapper.
- `resources/js/pages/landing.tsx` — Restores the stats section below the hero.
- `resources/js/components/landing/hero/hero-headline.tsx` — Restores live trust badge copy.
- `resources/js/components/landing/hero/hero-wordmark.tsx` — Restores visible wordmark and strapline.
- `app/Http/Controllers/PublicMilestoneController.php` — Uses explicit null-safe ordering for public milestones.
- `tests/Feature/MilestonesTest.php` — Covers the deterministic ordering contract.

### Approaches

1. **Scope-by-scope refactor (recommended)**
   - Refactor one or two related partials per scope, moving Card composition into each partial.
   - Add/update tests per scope before touching the next partial.
   - Lowest blast radius, easiest review, preserves existing behavior.
   - Pros: Testable, reviewable, safe rollback per scope.
   - Cons: Slightly more total commits; page-level `edit.tsx` cleanup deferred to final scope.
   - Effort: Low per scope; total Medium.

2. **Big-bang refactor**
   - Convert all partials and the page wrapper in a single PR.
   - Pros: Delivers a fully consistent page in one go.
   - Cons: Hard to review (400+ line budget risk), harder to debug regressions, tests need bulk updates.
   - Effort: High.

### Recommendation

**Review the candidate as "profile scope 1 plus collateral verification fixes."**

The main product-facing refactor is still small:

1. `update-profile-information-form`
2. `update-password-form`
3. `delete-user-form`
4. `edit.tsx`

The extra files should be treated as explicit collateral fixes required to keep review and verification honest:

1. `input.tsx` preserves shared ref behavior for focus management.
2. Landing files restore already-expected hero/stats copy and structure.
3. Milestone ordering fixes keep backend assertions deterministic across databases.

This keeps the product scope narrow while explaining why the workspace legitimately contains a few non-profile files.

**Suggested later scopes** (not part of this proposal):
- Scope 2: `update-privacy-form` + `update-notification-settings-form` — composed checkbox field rows, Card.
- Scope 3: `update-profile-complete-form` — raw inputs → shadcn, Badge tags, Card.
- Scope 4: `social-links-edit-form` + `delete-user-form` — Field wrappers, Dialog title, Card.

### Risks

- **Missing primitives**: `Slider`, `Accordion`, `FieldGroup`, `FieldSet` are not installed. We cannot fully align `update-profile-complete-form` (range slider, tech accordion) or checkbox groups until those are added or we compose them by hand. The first scope avoids these entirely.
- **Test coverage gaps**: Four of seven partials have no tests. Each scope should include test creation to avoid regressions.
- **Inertia `useForm` mocking**: Vitest tests for these forms require careful `vi.mock` of `@inertiajs/react`; existing tests (`privacy`, `notifications`, `complete-form`) provide a working pattern.
- **Artifact drift risk**: Because the candidate now includes shared-input, landing, and milestone follow-ups, proposal/design/tasks/apply-progress must list those files explicitly or the review story becomes misleading.

### Ready for Proposal

**Yes, with the updated scope statement.** The reviewer should be told:

> "The main change is still the scope-1 profile refactor around `Información del Perfil`, `Actualizar Contraseña`, and `Eliminar Cuenta`. The same candidate also carries three small collateral fixes: shared `Input` ref forwarding for focus behavior, landing hero/stats copy restoration so Vitest matches the rendered page again, and deterministic milestone ordering for backend verification." 
