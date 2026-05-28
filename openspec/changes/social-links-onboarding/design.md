# Design: Social Links Onboarding

## Technical Approach

Insert a new social links step (step 3) between the existing bio step (step 2) and avatar step (step 3→4). The change adds a `social_links` table with a `(user_id, platform)` unique constraint, an Eloquent `SocialLink` model, a `SaveStepSocialLinksRequest` FormRequest, a `saveSocialLinks` method on the existing `OnboardingService`, a controller endpoint, and a React UI section inside the monolithic `onboarding/index.tsx`. The onboarding step count increases from 4 to 5.

## Architecture Decisions

### Decision: Step numbering

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Internal 2.5 (display "3 of 5") | Matches proposal intent, clean UX | **Chosen** — display step 3, logical position after bio |
| Rename all steps (1-5 sequential) | More changes to existing code | Rejected — unnecessary churn |

The frontend `currentStep` becomes 3 for social links. Existing step 3 (avatar) becomes 4, step 4 (recommendations) becomes 5. `totalSteps` changes from 4 to 5.

### Decision: Upsert strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `updateOrCreate` per link | N+1 queries, simple | Rejected — inefficient for 4 platforms |
| `upsert` batch | Single query, MySQL-specific | **Chosen** — `SocialLink::upsert()` with `(user_id, platform)` as unique index |
| `sync` like techs | Deletes missing links | Rejected — spec says additive only |

### Decision: Frontend placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extract to separate step component | Cleaner, but breaks existing monolith pattern | Rejected — keep consistency |
| Inline in `index.tsx` (current pattern) | Large file, but matches existing convention | **Chosen** — follow existing monolithic step pattern |

### Decision: Route naming

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `/onboarding/step-2b` | Matches proposal | Rejected — inconsistent with numbered pattern |
| `/onboarding/step-2.5` | Invalid URL segment | Rejected |
| `/onboarding/step-social-links` | Semantic, clear | **Chosen** — descriptive and RESTful |

### Decision: Platform icons

| Option | Tradeoff | Decision |
|--------|----------|----------|
| External icon library (react-icons) | Adds dependency, bundle size | Rejected |
| SVG inline components | Zero deps, matches proposal | **Chosen** — inline SVGs in a helper object |
| lucide-react (already installed) | Limited social brand icons | Rejected — doesn't have GitHub/LinkedIn |

## Data Flow

```
User fills URL inputs (React state)
        │
        ▼
  Click "Siguiente"
        │
        ▼
  router.post('/onboarding/step-social-links', {
    links: [{ platform: 'github', url: '...' }, ...]
  })
        │
        ▼
  SaveStepSocialLinksRequest validates
        │
        ▼
  OnboardingController::saveStepSocialLinks()
        │
        ▼
  OnboardingService::saveSocialLinks($user, $links)
        │
        ▼
  SocialLink::upsert() — create or update per platform
        │
        ▼
  redirect → onboarding.index (step 4: avatar)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database/migrations/{timestamp}_create_social_links_table.php` | Create | Migration with `social_links` table, enum platform, unique(user_id, platform) |
| `app/Models/SocialLink.php` | Create | Eloquent model with fillable, casts, belongsTo User |
| `app/Http/Requests/Onboarding/SaveStepSocialLinksRequest.php` | Create | FormRequest with links array validation |
| `app/Services/OnboardingService.php` | Modify | Add `saveSocialLinks(User, array): void` method |
| `app/Http/Controllers/OnboardingController.php` | Modify | Add `saveStepSocialLinks()` method |
| `routes/web.php` | Modify | Add `POST /onboarding/step-social-links` route |
| `app/Models/User.php` | Modify | Add `socialLinks()` hasMany relationship |
| `resources/js/types/index.ts` | Modify | Add `SocialLink` interface |
| `resources/js/pages/onboarding/index.tsx` | Modify | Add step 3 UI, update totalSteps to 5, renumber steps 3→4, 4→5 |

## Interfaces / Contracts

### Migration Schema

```php
Schema::create('social_links', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->enum('platform', ['github', 'linkedin', 'twitter', 'website']);
    $table->string('url', 2048);
    $table->timestamps();
    $table->unique(['user_id', 'platform']);
});
```

### SocialLink Model

```php
class SocialLink extends Model
{
    use HasFactory;

    protected $fillable = ['platform', 'url', 'user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

### TypeScript Types

```typescript
export type Platform = 'github' | 'linkedin' | 'twitter' | 'website';

export interface SocialLink {
    platform: Platform;
    url: string;
}
```

### Frontend Platform Config

```typescript
const PLATFORMS: { key: Platform; label: string; placeholder: string; icon: ReactNode }[] = [
    { key: 'github',    label: 'GitHub',    placeholder: 'https://github.com/tu-usuario', icon: <GitHubIcon /> },
    { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/tu-perfil', icon: <LinkedInIcon /> },
    { key: 'twitter',   label: 'Twitter/X', placeholder: 'https://x.com/tu-usuario', icon: <TwitterIcon /> },
    { key: 'website',   label: 'Website',   placeholder: 'https://tu-sitio.com', icon: <WebsiteIcon /> },
];
```

### Service Method

```php
public function saveSocialLinks(User $user, array $links): void
{
    if (empty($links)) {
        return;
    }

    $records = collect($links)->map(function ($link) use ($user) {
        return [
            'user_id'  => $user->id,
            'platform' => $link['platform'],
            'url'      => $link['url'],
        ];
    })->all();

    SocialLink::upsert($records, ['user_id', 'platform'], ['url']);
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `SocialLink` model fillable, relationship | PHPUnit model test |
| Unit | `OnboardingService::saveSocialLinks` creates/updates/upserts | PHPUnit with `RefreshDatabase` |
| Feature | `POST /onboarding/step-social-links` — valid data saves and redirects | PHPUnit Feature test |
| Feature | `POST /onboarding/step-social-links` — invalid URL returns 422 | PHPUnit Feature test |
| Feature | `POST /onboarding/step-social-links` — invalid platform rejected | PHPUnit Feature test |
| Feature | `POST /onboarding/step-social-links` — duplicate platform updates existing | PHPUnit Feature test |
| Feature | Cascade delete: user deletion removes social_links | PHPUnit Feature test |

## Migration / Rollout

No migration required beyond the standard `php artisan migrate`. The table is new with no existing data. Rollback: `php artisan migrate:rollback --step=1` removes the table.

## Open Questions

- None
