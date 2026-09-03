# Apply Progress: Onboarding Idea Recommendations

**Change**: onboarding-idea-recommendations
**Mode**: Strict TDD
**Delivery**: single PR — `feat/onboarding-idea-recommendations` → `development` (PR #237)
**Status**: 23/23 tasks complete. Ready for verify.

## Completed Tasks

All 8 phases / 23 tasks marked `[x]` in `tasks.md`.

- Phase 1 (1.1-1.4): `ProjectIdeaService` + `ProjectIdeaServiceTest` (RED→GREEN, pint clean)
- Phase 2 (2.1-2.2): `ProjectController@create` method-injects the service; `ProjectIdeaInspirationTest` green with zero edits
- Phase 3 (3.1-3.4): `OnboardingTest` additions (RED→GREEN); `SaveStep4Request` `idea_slug` rule; `OnboardingController` promoted ctor + `featuredIdeas` prop + `saveStep4()` redirect branch
- Phase 4 (4.1-4.2): `SaveStep4Data` + `step4Schema` gain optional `idea_slug`
- Phase 5 (5.1-5.4): `@base-ui/react` radio-group/radio exports confirmed usable (no shadcn fallback); `onboarding-idea-teaser.test.tsx` (RED→GREEN); `onboarding-idea-teaser.tsx`
- Phase 6 (6.1): `onboarding/index.tsx` step-5 wiring
- Phase 7 (7.1-7.2): `index.test.tsx` mock props + new step-5 `describe` asserting `idea_slug` POST body
- Phase 8 (8.1-8.4): all gates green

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1/1.2/1.3 | `tests/Unit/Services/ProjectIdeaServiceTest.php` | Unit | N/A (new) | ✅ 8 failed (class not found) | ✅ 7 passed | ✅ 7 cases (published-only, ordering, tie-break, unpublished-exclusion, empty, transformer parity, shape) | ✅ dropped 1 redundant shape test |
| 2.1 | `tests/Feature/ProjectIdeaInspirationTest.php` (approval) | Feature | ✅ 14/14 before | ➖ refactor | ✅ 14/14 after, zero edits | ➖ existing suite | ➖ none |
| 3.1/3.2/3.3 | `tests/Feature/OnboardingTest.php` | Feature | ✅ 24/24 before | ✅ 4 failed | ✅ 28 passed | ✅ 6 cases (prop equality, valid slug redirect+complete+join, unpublished reject, unknown reject, no-slug dashboard, empty-slug dashboard) | ✅ pint |
| 5.2/5.3 | `resources/js/components/onboarding/onboarding-idea-teaser.test.tsx` | Component (RTL) | N/A (new) | ✅ import fail | ✅ 5 passed | ✅ 5 cases (render, chip cap +N, select→slug, reselect→null, empty→nothing) | ➖ none |
| 7.2 | `resources/js/pages/onboarding/index.test.tsx` | Page (RTL) | ✅ 3/3 before | ✅ (drives to step 5) | ✅ 4 passed | ➖ single focused step-5 case | ➖ none |

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test | `php artisan test --filter=ProjectIdeaServiceTest` → 7 passed; `--filter=OnboardingTest` → 28 passed; `npx vitest run .../onboarding-idea-teaser.test.tsx` → 5 passed |
| Runtime harness | `php artisan test` → 566 passed (2241 assertions); `npm test` → 167 passed (46 files); `npm run build` → built in 6.77s; `npx tsc --noEmit` → exit 0; `./vendor/bin/pint --dirty` → passed |
| Rollback boundary | Delete `app/Services/ProjectIdeaService.php` + its test; revert `create()` inline query in `ProjectController`; revert `OnboardingController` / `SaveStep4Request`; delete `resources/js/components/onboarding/`; revert `onboarding/index.tsx`, types, zod, `test/setup.ts` polyfill, and the 2 modified test files |

## Deviations from Design

- Transformer now emits `illustrationUrl` (merged #236 after design was written); flows through automatically, teaser ignores it. Test key-list updated.
- Rejection feature tests assert `assertSessionHasErrors('idea_slug')` (Inertia redirect-back error bag) instead of a raw HTTP 422 — behaviorally equivalent to the spec's "validation MUST fail".
- Added `PointerEvent` + pointer-capture polyfill to `resources/js/test/setup.ts` (jsdom gap hit by `@base-ui/react` Radio). Additive; full suite stays green.
- Step-5 page test drives through steps 1-4 in a dedicated `describe` (wizard always mounts at step 1) rather than a separate file — design risk #4 lower-friction path.
- Pint `--dirty` reformatted a few unrelated lines in the two touched controllers; kept to keep the pint gate green.
- Authored diff ~842 lines (~590 tests) vs ~800 budget; not sliced (tasks forecast already records `size-exception` / High risk; overage is test coverage).

## Issues Found

None blocking. SDD attempt ledger returned `invalid_continuation` on acquire but `status` showed the attempt already `running` with the matching token — proceeded.
