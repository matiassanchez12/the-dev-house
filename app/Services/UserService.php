<?php

namespace App\Services;

use App\Models\Tech;
use App\Models\User;
use App\Models\UserPrivacySetting;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    /**
     * Get users suitable for public landing-page display.
     *
     * Users who opted out of discovery must not appear in public listings.
     */
    public function getAllUsers(): Collection
    {
        return User::query()
            ->with('techs')
            ->where(function ($q) {
                $q->whereHas('privacySetting', fn ($sub) => $sub->where('is_discoverable', true))
                    ->orWhereDoesntHave('privacySetting');
            })
            ->get();
    }

    /**
     * Get discoverable users with optional search and tech filters.
     *
     * @param array{q?: string|null, tech?: string|null, page?: int, per_page?: int} $filters
     * @return LengthAwarePaginator
     */
    public function getDiscoverableUsers(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->select(['id', 'name', 'slug', 'bio', 'avatar'])
            ->withCount('createdProjects')
            ->withCount(['participatingProjects as joined_projects_count'])
            ->with(['techs' => function ($q) {
                $q->select('techs.id', 'name', 'slug');
            }])
            // Privacy (issue #142): users who opted out of discovery are excluded
            // from the directory. Users without a privacy settings row are
            // included by default (back-compat) — the column default is true.
            ->where(function ($q) {
                $q->whereHas('privacySetting', fn ($sub) => $sub->where('is_discoverable', true))
                  ->orWhereDoesntHave('privacySetting');
            });

        if (! empty($filters['q'])) {
            $query->where('name', 'LIKE', '%' . $filters['q'] . '%');
        }

        if (! empty($filters['tech'])) {
            $query->whereHas('techs', function ($q) use ($filters) {
                $q->where('slug', $filters['tech']);
            });
        }

        $perPage = $filters['per_page'] ?? 12;

        return $query->paginate($perPage);
    }

    /**
     * Get public profile data for a user with eager loaded relations.
     *
     * @param User $user
     * @return array
     */
    public function getPublicProfile(User $user): array
    {
        $user->load([
            'createdProjects.creator.techs',
            'createdProjects.techs',
            'participatingProjects.creator.techs',
            'participatingProjects.techs',
            'participatingProjects.participants',
            'privacySetting',
            'techs',
            'socialLinks',
        ]);

        $privacy = $user->privacySetting;
        $showEmail = (bool) ($privacy?->show_email ?? UserPrivacySetting::DEFAULTS['show_email']);
        $showPhone = (bool) ($privacy?->show_phone ?? UserPrivacySetting::DEFAULTS['show_phone']);
        $showActivity = (bool) ($privacy?->show_activity ?? UserPrivacySetting::DEFAULTS['show_activity']);

        $createdProjects = $user->createdProjects->map(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'status' => $project->status,
                'images' => $project->images ?? [],
                'description' => $project->description,
                'creator' => [
                    'id' => $project->creator->id,
                    'name' => $project->creator->name,
                    'avatar' => $project->creator->avatar,
                ],
                'techs' => $project->techs->map(fn ($tech) => [
                    'id' => $tech->id,
                    'name' => $tech->name,
                    'slug' => $tech->slug,
                ])->toArray(),
                'participants_count' => $project->participants->count(),
                'created_at' => $project->created_at?->toISOString(),
            ];
        })->toArray();

        $participatingProjects = $user->participatingProjects->map(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'status' => $project->status,
                'images' => $project->images ?? [],
                'description' => $project->description,
                'creator' => [
                    'id' => $project->creator->id,
                    'name' => $project->creator->name,
                    'avatar' => $project->creator->avatar,
                ],
                'techs' => $project->techs->map(fn ($tech) => [
                    'id' => $tech->id,
                    'name' => $tech->name,
                    'slug' => $tech->slug,
                ])->toArray(),
                'participants_count' => $project->participants->count(),
                'created_at' => $project->created_at?->toISOString(),
            ];
        })->toArray();

        $techs = $user->techs
            ->sortByDesc(fn ($tech) => $tech->pivot->years_experience)
            ->values()
            ->map(fn ($tech) => [
                'id' => $tech->id,
                'name' => $tech->name,
                'slug' => $tech->slug,
                'years' => $tech->pivot->years_experience,
                'proficiency' => $tech->pivot->proficiency,
            ])->toArray();

        $profile = [
            'id' => $user->id,
            'name' => $user->name,
            'bio' => $user->bio,
            'avatar' => $user->avatar,
            'created_at' => $user->created_at?->toISOString(),
            'privacySetting' => $user->privacySetting?->toArray(),
            'socialLinks' => $user->socialLinks->map(fn ($link) => [
                'id' => $link->id,
                'platform' => $link->platform,
                'url' => $link->url,
            ])->toArray(),
            'createdProjects' => $showActivity ? $createdProjects : [],
            'participatingProjects' => $showActivity ? $participatingProjects : [],
            'techs' => $techs,
        ];

        if ($showEmail) {
            $profile['email'] = $user->email;
        }

        if ($showPhone && $user->phone !== null) {
            $profile['phone'] = $user->phone;
        }

        return $profile;
    }
}
