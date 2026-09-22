# Design: Onboarding Idea Recommendations

## Technical Approach

Extract the `/projects/create` catalog query into an autowired `App\Services\ProjectIdeaService`
(no interface, matching `OnboardingService` / `ProjectFollowService`). The service owns two read
methods that both serialize through the existing `App\Helpers\ApiResourceTransformer::projectIdeas()`
so the create-page payload stays byte-identical and the new onboarding payload shares its shape.

`OnboardingController@index` gains a `featuredIdeas` Inertia prop. `saveStep4()` branches its
redirect on a new optional `idea_slug` — the branch lives inside `saveStep4()` only, never in the
shared `private complete()` that `skip()` also calls. A new presentational component
`OnboardingIdeaTeaser` renders a `@base-ui/react` `RadioGroup` of compact idea cards on step 5.

Maps to proposal "Approach"; satisfies spec requirements: Catalog query service, Featured selection,
Onboarding index exposes featured ideas, Step 5 teaser, Completion handoff, Join+idea coexistence,
Existing behavior preserved.

## Architecture Decisions

### Decision: `ProjectIdeaService` methods return `array` (serialized), not `Collection`

**Choice**: `publishedForDisplay(): array` and `featuredForOnboarding(): array`, each ending in a
single `ApiResourceTransformer::projectIdeas(...)` call. Controllers assign the result straight to an
Inertia prop.
**Alternatives considered**: (a) proposal's `publishedForDisplay(): Collection` returning the raw
Eloquent collection, leaving `ApiResourceTransformer::projectIdeas()` in `ProjectController@create`.
(b) A dedicated `FeaturedIdeaResource` / API Resource class.
**Rationale**: The spec says `publishedForDisplay()` MUST return ideas "serialized through
`ApiResourceTransformer::projectIdeas()`", and `featuredForOnboarding()` is explicitly `array`.
Keeping serialization inside the service gives one transform site, symmetric signatures, and a
byte-identical create-page prop. `array` serializes cleanly through Inertia. Option (b) duplicates
ordering logic the transformer already owns. (auto-force assumption logged: overrides the proposal's
`: Collection` hint, which conflicts with "transformed array" and the spec wording.)

### Decision: `featuredForOnboarding()` groups in PHP over one query

**Choice**: `ProjectIdea::published()->with('techs:id')->orderBy('sort_order')->get()` then
`groupBy(category)`, per group `sortBy([[sort_order,asc],[id,asc]])->first()`, order groups by
`array_flip(ProjectIdeaCategory::values())`, then one transformer call.
**Alternatives considered**: correlated subquery / window function selecting `MIN(sort_order)` per
category; a new `is_featured` column.
**Rationale**: <=15 rows on the seeded catalog — PHP grouping is trivial, DB-portable (SQLite tests +
MySQL), needs no new SQL, and is empty-safe (`[]` when no published rows). `is_featured` is a locked
non-goal. `->orderBy('sort_order')` is retained for zero-risk parity even though the transformer
re-sorts.

### Decision: redirect branch inside `saveStep4()` only

**Choice**: In `saveStep4()`, after the join-request block, read `idea_slug`; if set, call
`$this->onboardingService->complete(Auth::user())` then
`return redirect()->route('projects.create', ['idea' => $ideaSlug])`; else `return $this->complete()`.
`private complete()` and `skip()` are untouched.
**Alternatives considered**: parameterize `complete(?string $ideaSlug)`; handle the redirect in the
frontend `onSuccess`.
**Rationale**: `skip()` shares `complete()` and must always land on `/dashboard`. A parameter on
`complete()` risks `skip()` regressions. Server-side redirect keeps the Inertia flow (no `onSuccess`
in step 5 today) and keeps the slug validated server-side.

### Decision: published-scoped `Rule::exists`

**Choice**: `Rule::exists('project_ideas', 'slug')->where('is_published', true)` with Spanish
`idea_slug.exists` message.
**Alternatives considered**: bare `exists:project_ideas,slug`; no DB check.
**Rationale**: The create page silently ignores an unpublished slug; rejecting it at the boundary
keeps the contract honest at ~0 cost. `ConvertEmptyStringsToNull` turns `''` into `null` before
rules run, so `nullable` short-circuits an empty submission.

### Decision: `@base-ui/react` `RadioGroup` as the single-select primitive

**Choice**: Build `OnboardingIdeaTeaser` directly on `RadioGroup` + `Radio` from `@base-ui/react`
(same primitive family already wrapped by `checkbox.tsx`, `select.tsx`, etc.). Re-clicking the
selected card's radio calls `onSelect(null)` to deselect.
**Alternatives considered**: shadcn `ToggleGroup` (`type="single"`); reusing `ProjectIdeaCard`;
multi-select checkboxes like the join list.
**Rationale**: RadioGroup is the semantically correct "pick at most one" control and needs no extra
a11y wiring. `ToggleGroup` deselect is easy but the control is designed for formatting toggles, not
a canonical exclusive choice. `ProjectIdeaCard`'s footer button means "prefill and go", the wrong
affordance. The teaser stays its own file — `index.tsx` is ~805 lines.

### Decision: reuse the create-page `ProjectIdea` TS type

**Choice**: `export type FeaturedIdea = ProjectIdea` (from `resources/js/types/index.ts`). The
payload shape `{slug,title,summary,category,difficulty,prefillTitle,prefillDescription,prefillVision,techIds}`
already matches the transformer output.
**Rationale**: Same serializer ⇒ same shape; a distinct interface would drift.

## Data Flow

```
GET /onboarding
  OnboardingController@index
    └─ ProjectIdeaService::featuredForOnboarding()
         ProjectIdea::published()+techs ─→ groupBy category ─→ min(sort_order,id) per group
         ─→ enum-order groups ─→ ApiResourceTransformer::projectIdeas() ─→ array
    └─ Inertia prop `featuredIdeas`  ──→  pages/onboarding/index.tsx (step 5)
                                            └─ <OnboardingIdeaTeaser ideas selectedSlug onSelect techNamesById>
                                                  RadioGroup → selectedIdeaSlug state

Step 5 "Finalizar"
  router.post('/onboarding/step-4', { join_requests, idea_slug })
    └─ SaveStep4Request (idea_slug: nullable|string|exists published)
    └─ OnboardingController@saveStep4
         ├─ sendJoinRequests(...)            (unchanged, conditional)
         ├─ idea_slug set?  ── yes ─→ OnboardingService::complete(user) ─→ redirect projects.create?idea=<slug>
         └─                  ── no  ─→ private complete() ─→ redirect /dashboard

GET /projects/create
  ProjectController@create(ProjectIdeaService $svc)
    └─ $svc->publishedForDisplay()  (= ApiResourceTransformer::projectIdeas(published+techs))
    └─ Inertia prop `projectIdeas`  (byte-identical to pre-refactor)
```

### Sequence: step 5 → complete → redirect

```
User        index.tsx        Inertia router      saveStep4()         OnboardingService     Browser
 │  click "Finalizar" │            │                  │                     │                │
 ├───────────────────>│            │                  │                     │                │
 │      │  router.post('/onboarding/step-4',          │                     │                │
 │      │    { join_requests: selectedProjects,       │                     │                │
 │      │      idea_slug: selectedIdeaSlug ?? undefined }) │              │                │
 │      ├───────────────────────>  │                  │                     │                │
 │      │            │  POST (validated by SaveStep4Request)               │                │
 │      │            ├────────────────────────────>   │                     │                │
 │      │            │                  │  join_requests non-empty?         │                │
 │      │            │                  ├──── sendJoinRequests(user, ids) ─>│                │
 │      │            │                  │  idea_slug !== null?              │                │
 │      │            │                  ├──── complete(user) ──────────────>│ sets           │
 │      │            │                  │                     │  onboarding_completed_at     │
 │      │            │                  │  redirect()->route('projects.create',['idea'=>$slug]) │
 │      │            │  302 Location: /projects/create?idea=<slug>          │                │
 │      │            │<────────────────────────────    │                     │                │
 │      │  Inertia follows redirect (GET) ───────────────────────────────────────────────>  │
 │      │            │            │  ProjectController@create renders projects/create        │
 │      │  create.tsx reads ?idea=<slug>, prefills empty fields (#233)      │                │
 │<─────┴────────────┴────────────┴──────────────────────────────────────────────────────── │

 Alternate (no idea_slug):  saveStep4() → private complete() → complete(user) → redirect('/dashboard')
 Alternate (POST /onboarding/skip): skip() → private complete() → redirect('/dashboard')   [unchanged]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/Services/ProjectIdeaService.php` | Create | `publishedForDisplay(): array`, `featuredForOnboarding(): array`, private `publishedIdeas(): Collection` |
| `app/Http/Controllers/ProjectController.php` | Modify | `create()` method-injects `ProjectIdeaService`; inline query removed; prop unchanged |
| `app/Http/Controllers/OnboardingController.php` | Modify | Promoted constructor + `ProjectIdeaService`; `index()` adds `featuredIdeas`; `saveStep4()` redirect branch |
| `app/Http/Requests/Onboarding/SaveStep4Request.php` | Modify | `idea_slug` rule + `use Illuminate\Validation\Rule;` + Spanish message + attribute |
| `resources/js/components/onboarding/onboarding-idea-teaser.tsx` | Create | Presentational `RadioGroup` teaser; `export type FeaturedIdea = ProjectIdea` |
| `resources/js/pages/onboarding/index.tsx` | Modify | Step-5-only: `featuredIdeas` prop read, `selectedIdeaSlug` state, `techNamesById` memo, render teaser, POST body `idea_slug` |
| `resources/js/types/onboarding.ts` | Modify | `SaveStep4Data` gains `idea_slug?: string` |
| `resources/js/hooks/use-onboarding-validation.ts` | Modify | `step4Schema` gains `idea_slug: z.string().optional()` |
| `tests/Unit/Services/ProjectIdeaServiceTest.php` | Create | Selection + ordering + parity + empty-safe |
| `tests/Feature/OnboardingTest.php` | Modify | Additions only — slug redirect / 422 / no-slug / skip |
| `resources/js/components/onboarding/onboarding-idea-teaser.test.tsx` | Create | Render / single-select / deselect / empty→null |
| `resources/js/pages/onboarding/index.test.tsx` | Modify | Mock props gain `featuredIdeas` + confirm `allTechs` present |

## Interfaces / Contracts

### `app/Services/ProjectIdeaService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ProjectIdeaCategory;
use App\Helpers\ApiResourceTransformer;
use App\Models\ProjectIdea;
use Illuminate\Support\Collection;

final class ProjectIdeaService
{
    /**
     * Published ideas exactly as /projects/create renders them.
     *
     * @return array<int, array<string, mixed>>
     */
    public function publishedForDisplay(): array
    {
        return ApiResourceTransformer::projectIdeas($this->publishedIdeas());
    }

    /**
     * One published idea per ProjectIdeaCategory (lowest sort_order, id tie-break),
     * in enum order. Empty when no published ideas exist.
     *
     * @return array<int, array<string, mixed>>
     */
    public function featuredForOnboarding(): array
    {
        $categoryOrder = array_flip(ProjectIdeaCategory::values());

        $featured = $this->publishedIdeas()
            ->groupBy(fn (ProjectIdea $idea): string => $idea->category->value)
            ->map(fn (Collection $group): ProjectIdea => $group
                ->sortBy([['sort_order', 'asc'], ['id', 'asc']])
                ->first())
            ->sortBy(fn (ProjectIdea $idea): int => $categoryOrder[$idea->category->value] ?? 99)
            ->values();

        return ApiResourceTransformer::projectIdeas($featured);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, ProjectIdea>
     */
    private function publishedIdeas(): Collection
    {
        return ProjectIdea::published()
            ->with('techs:id')
            ->orderBy('sort_order')
            ->get();
    }
}
```

Notes: `ApiResourceTransformer::projectIdeas()` already re-sorts by
`sprintf('%02d-%06d', categoryIndex, sort_order)` and emits camelCase prefill keys + `''` for null
vision + integer `techIds`, so both methods inherit that contract. `->first()` on a `groupBy` bucket
is always non-null (buckets are never empty); if PHPStan flags it, add a local `@var` — do not add a
runtime guard.

### `ProjectController@create` (exact replacement)

Before (L79-89):

```php
public function create()
{
    $projectIdeas = ProjectIdea::published()
        ->with('techs:id')
        ->orderBy('sort_order')
        ->get();

    return Inertia::render('projects/create', [
        'projectIdeas' => ApiResourceTransformer::projectIdeas($projectIdeas),
    ]);
}
```

After:

```php
public function create(ProjectIdeaService $projectIdeaService)
{
    return Inertia::render('projects/create', [
        'projectIdeas' => $projectIdeaService->publishedForDisplay(),
    ]);
}
```

Add `use App\Services\ProjectIdeaService;`. The `use App\Models\ProjectIdea;` import may become
unused — remove it only if nothing else in the controller references it.

### `OnboardingController` (constructor + index + saveStep4)

```php
public function __construct(
    private OnboardingService $onboardingService,
    private ProjectIdeaService $projectIdeaService,
) {}
```

(Replaces the current explicit `private OnboardingService $onboardingService;` property + assignment,
matching `ProjectController`'s promoted multi-service constructor. Add
`use App\Services\ProjectIdeaService;`.)

```php
public function index()
{
    $user = Auth::user();

    if ($user->hasCompletedOnboarding()) {
        return redirect()->route('dashboard');
    }

    $allTechs = \App\Models\Tech::all();
    $userTechs = $user->techs()->withPivot('proficiency')->get();

    return inertia('onboarding/index', [
        'user' => ['bio' => $user->bio, 'avatar' => $user->avatar],
        'allTechs' => $allTechs,
        'userTechs' => $userTechs,
        'totalSteps' => 5,
        'featuredIdeas' => $this->projectIdeaService->featuredForOnboarding(),
    ]);
}
```

```php
public function saveStep4(SaveStep4Request $request)
{
    $validated = $request->validated();

    $joinRequests = $validated['join_requests'] ?? [];
    if (!empty($joinRequests)) {
        $this->onboardingService->sendJoinRequests(Auth::user(), $joinRequests);
    }

    $ideaSlug = $validated['idea_slug'] ?? null;

    if ($ideaSlug !== null) {
        $this->onboardingService->complete(Auth::user());

        return redirect()->route('projects.create', ['idea' => $ideaSlug]);
    }

    return $this->complete();
}
```

`skip()` is **unchanged** (`return $this->complete();`). `private complete()` is **unchanged**
(`OnboardingService::complete()` + `redirect()->route('dashboard')`). `complete(user)` in the idea
branch is the exact same call `private complete()` makes, so `onboarding_completed_at` is set
identically on both paths.

### `SaveStep4Request`

```php
use Illuminate\Validation\Rule;
// ...
public function rules(): array
{
    return [
        'join_requests' => ['nullable', 'array'],
        'join_requests.*' => ['integer'],
        'idea_slug' => [
            'nullable',
            'string',
            Rule::exists('project_ideas', 'slug')->where('is_published', true),
        ],
    ];
}

public function messages(): array
{
    return [
        'join_requests.array' => 'El campo join_requests debe ser un arreglo.',
        'join_requests.*.integer' => 'Cada ID de proyecto debe ser un número entero.',
        'idea_slug.exists' => 'La idea seleccionada no es válida.',
    ];
}

public function attributes(): array
{
    return [
        'join_requests' => 'solicitudes a proyectos',
        'join_requests.*' => 'proyecto',
        'idea_slug' => 'idea seleccionada',
    ];
}
```

`ConvertEmptyStringsToNull` (Laravel 12 default global middleware) converts `''` → `null` before
validation, so an empty `idea_slug` passes `nullable` and never hits the `exists` rule.

### `resources/js/components/onboarding/onboarding-idea-teaser.tsx` (skeleton)

```tsx
import { RadioGroup } from '@base-ui/react/radio-group'
import { Radio } from '@base-ui/react/radio'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProjectIdea } from '@/types'

export type FeaturedIdea = ProjectIdea

interface OnboardingIdeaTeaserProps {
    ideas: FeaturedIdea[]
    selectedSlug: string | null
    onSelect: (slug: string | null) => void
    techNamesById: Map<number, string>
}

export function OnboardingIdeaTeaser({
    ideas,
    selectedSlug,
    onSelect,
    techNamesById,
}: OnboardingIdeaTeaserProps) {
    if (ideas.length === 0) return null

    return (
        <section className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">
                    ¿Preferís arrancar tu propia idea?
                </h3>
                <a href="/projects/create" className="text-xs text-muted-foreground underline">
                    ver todas las ideas
                </a>
            </div>

            <RadioGroup
                aria-label="Ideas de proyecto destacadas"
                value={selectedSlug ?? ''}
                onValueChange={(value) => onSelect(value ? String(value) : null)}
                className="flex flex-col gap-2"
            >
                {ideas.map((idea) => {
                    const isSelected = idea.slug === selectedSlug
                    const techNames = idea.techIds
                        .map((id) => techNamesById.get(id))
                        .filter((name): name is string => Boolean(name))

                    return (
                        <label
                            key={idea.slug}
                            className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors',
                                isSelected && 'border-primary bg-primary/5',
                            )}
                        >
                            <Radio.Root
                                value={idea.slug}
                                onClick={() => {
                                    if (isSelected) onSelect(null)
                                }}
                                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input data-checked:border-primary"
                            >
                                <Radio.Indicator className="size-2 rounded-full bg-primary" />
                            </Radio.Root>

                            <div className="flex flex-1 flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {idea.title}
                                    </span>
                                    {idea.difficulty && (
                                        <Badge variant="secondary" className="text-xs capitalize">
                                            {idea.difficulty}
                                        </Badge>
                                    )}
                                </div>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {idea.summary}
                                </p>
                                {techNames.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {techNames.slice(0, 3).map((name) => (
                                            <Badge key={name} variant="outline" className="text-xs">
                                                {name}
                                            </Badge>
                                        ))}
                                        {techNames.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{techNames.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </label>
                    )
                })}
            </RadioGroup>
        </section>
    )
}
```

Tailwind v4 only, no `dark:` overrides — semantic tokens (`border-border`, `text-muted-foreground`,
`bg-primary/5`) switch automatically. If `@base-ui/react/radio-group` / `radio` sub-path exports
differ in v1.5.0, fall back to the shadcn wrapper: `npx shadcn@latest add radio-group` and import
from `@/components/ui/radio-group` (verify during apply; keep the same props contract).

### `resources/js/pages/onboarding/index.tsx` (step-5-only diff)

```tsx
// new imports
import { useState, useEffect, useMemo } from 'react'
import { OnboardingIdeaTeaser, type FeaturedIdea } from '@/components/onboarding/onboarding-idea-teaser'

// OnboardingProps
interface OnboardingProps extends SharedPageProps {
    // ...existing...
    featuredIdeas?: FeaturedIdea[]
}

// in component body (near the other step-5 state)
const featuredIdeas = usePage<OnboardingProps>().props.featuredIdeas ?? []
const [selectedIdeaSlug, setSelectedIdeaSlug] = useState<string | null>(null)
const techNamesById = useMemo(
    () => new Map(allTechs.map((tech) => [tech.id, tech.name])),
    [allTechs],
)

// step-5 render, immediately below the join-recommendations list container
<OnboardingIdeaTeaser
    ideas={featuredIdeas}
    selectedSlug={selectedIdeaSlug}
    onSelect={setSelectedIdeaSlug}
    techNamesById={techNamesById}
/>

// step-5 handleNext POST body
router.post(
    '/onboarding/step-4',
    { join_requests: selectedProjects, idea_slug: selectedIdeaSlug ?? undefined },
    { preserveScroll: true, onError: /* unchanged */, onFinish: /* unchanged */ },
)
```

`allTechs` is already destructured from `usePage().props` at the top of the component (index prop),
so `techNamesById` needs no new prop. `?? undefined` keeps `idea_slug` out of the payload entirely
when nothing is selected (server treats absent === empty === `/dashboard`).

### Type / schema deltas

```ts
// resources/js/types/onboarding.ts
export interface SaveStep4Data {
    join_requests: number[];
    idea_slug?: string;
}

// resources/js/hooks/use-onboarding-validation.ts
export const step4Schema = z.object({
    join_requests: z.array(z.number()).nullable(),
    idea_slug: z.string().optional(),
});
```

`FeaturedIdea` is `ProjectIdea` re-exported from the teaser component; `types/index.ts` needs no
change (it already defines `ProjectIdea`).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `publishedForDisplay()` parity | `tests/Unit/Services/ProjectIdeaServiceTest.php` — seed published + unpublished ideas via factory; assert result is published-only, in enum-order-then-`sort_order`, camelCase prefill keys, `''` for null vision, integer `techIds`. Assert it equals `ApiResourceTransformer::projectIdeas()` over the same query (contract lock). |
| Unit | `featuredForOnboarding()` selection | Same file — one idea per category; each is the lowest `sort_order`; `id` tie-break when two published share the lowest `sort_order`; unpublished with a lower `sort_order` is excluded; groups in `ProjectIdeaCategory` enum order; empty catalog ⇒ `[]`; payload shape identical to `publishedForDisplay()`. |
| Feature | Onboarding index prop | `tests/Feature/OnboardingTest.php` (additions only) — authenticated, not-completed user: `GET /onboarding` Inertia response has `featuredIdeas` equal to `featuredForOnboarding()`; `totalSteps === 5`. |
| Feature | Completion handoff | Step-4 + valid published `idea_slug` ⇒ redirect `/projects/create?idea=<slug>`, `onboarding_completed_at` set, join requests still created (assert `JoinRequest` rows). Step-4 + unpublished/unknown slug ⇒ 422, `onboarding_completed_at` still null. Step-4 + no slug ⇒ redirect `/dashboard` (existing assertion untouched). `POST /onboarding/skip` ⇒ `/dashboard` (existing assertion untouched). |
| Feature | Join + idea coexistence | Step-4 with both `join_requests` and a valid `idea_slug` ⇒ all join requests sent AND redirect to `/projects/create?idea=<slug>`. |
| Component | Teaser render / select | `resources/js/components/onboarding/onboarding-idea-teaser.test.tsx` (vitest + RTL) — renders one card per idea with title, `line-clamp-2` summary, difficulty badge when present, up to 3 tech chips + `+N`; selecting a card calls `onSelect(slug)`; selecting the active card again calls `onSelect(null)`; `ideas={[]}` renders nothing (`container.firstChild` null); "ver todas las ideas" is `<a href="/projects/create">`. No Ziggy `route()`. |
| Page | Step-5 POST body | `resources/js/pages/onboarding/index.test.tsx` — extend `mockState.props` with `featuredIdeas` (and keep `allTechs`). If advancing the existing mock to step 5 is impractical (current tests only reach steps 1-2), add one focused test (new `describe` block or `index.step5.test.tsx`) that mounts at step 5 and asserts `router.post('/onboarding/step-4', { join_requests: [], idea_slug: '<slug>' }, ...)` after selecting an idea. Document the choice in the test file header comment. |

### Tests touched vs left alone

- **New**: `tests/Unit/Services/ProjectIdeaServiceTest.php`,
  `resources/js/components/onboarding/onboarding-idea-teaser.test.tsx`.
- **Modified (additions only)**: `tests/Feature/OnboardingTest.php` (new cases; existing step-4-no-slug
  and skip `/dashboard` assertions unchanged), `resources/js/pages/onboarding/index.test.tsx`
  (mock props extended; steps 1-2 tests unchanged).
- **Untouched**: `tests/Feature/ProjectIdeaInspirationTest.php` (refactor is behavior-preserving —
  `projectIdeas` prop byte-identical), `resources/js/components/projects/*` idea tests,
  `OnboardingService` tests (none exist), `GET /onboarding/recommendations` JSON tests.

Strict TDD: write each RED test first, then implement. Gates: `php artisan test`, `npm test`,
`npm run build`.

## Threat Matrix

N/A — no shell commands, subprocesses, VCS/PR automation, executable-file classification, or
process-integration boundary. The one new redirect (`redirect()->route('projects.create', ['idea' =>
$slug])`) builds an internal named-route URL; `$slug` is validated against `project_ideas.slug` with a
published scope, so there is no open-redirect or injection surface.

## Migration / Rollout

No migration. No feature flag. Pure-additive: no schema change, no data change, no config change.
Rollback in one revert — delete `ProjectIdeaService`, restore the inline query in
`ProjectController@create`, drop the `featuredIdeas` prop and the `saveStep4()` branch (falls back to
`private complete()` ⇒ `/dashboard`), drop the `idea_slug` rule, delete the teaser + its wiring in
`index.tsx` / types / zod, revert the two modified test files. The onboarding half can be reverted
independently of the service refactor.

### Size forecast

| Bucket | ~Changed lines |
|--------|----------------|
| `ProjectIdeaService.php` | 55 |
| `ProjectController` / `OnboardingController` / `SaveStep4Request` | 40 |
| `onboarding-idea-teaser.tsx` | 115 |
| `index.tsx` + types + zod | 35 |
| `ProjectIdeaServiceTest.php` | 140 |
| `OnboardingTest.php` additions | 90 |
| `onboarding-idea-teaser.test.tsx` | 95 |
| `index.test.tsx` additions | 25 |
| **Total** | **~595** |

`Decision needed before apply: No`
`Chained PRs recommended: No`
`400-line budget risk: High` (~595 > 400 default reviewer guard, but within the session's accepted
`single-pr` budget of 800; ~350 of the ~595 lines are tests). No slicing required; flag surfaced for
the reviewer.

## Open Questions

- [ ] `@base-ui/react` v1.5.0 sub-path exports for `radio-group` / `radio` — confirm during apply;
  documented fallback is the shadcn `radio-group` wrapper. (auto-force: proceed with the primitive.)
- [ ] Whether `resources/js/pages/onboarding/index.test.tsx` can practically advance its mock to
  step 5, or a dedicated small step-5 test file is added. (auto-force: sdd-tasks picks the lighter
  path; both satisfy the spec.)

## Key Learnings

1. Both service methods return serialized `array` so `ApiResourceTransformer::projectIdeas()` stays the single ordering authority for the create page and onboarding.
2. The redirect branch is confined to `saveStep4()` because `skip()` shares `private complete()` and must always reach `/dashboard`.
3. `ConvertEmptyStringsToNull` makes an empty `idea_slug` bypass the published-scoped `Rule::exists` via `nullable`.
4. `@base-ui/react` `RadioGroup` is the semantically correct single-select primitive and needs a manual `onClick` to support click-to-deselect.
5. Forecast ~595 changed lines (≈350 tests) — within the 800-line single-PR budget but above the 400-line reviewer guard, flagged not sliced.
