<?php

namespace App\Services;

use App\Models\User;

class UserService
{
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
            'techs',
        ]);

        $createdProjects = $user->createdProjects->map(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'status' => $project->status,
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
            ];
        })->toArray();

        $participatingProjects = $user->participatingProjects->map(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'status' => $project->status,
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
            ];
        })->toArray();

        $techs = $user->techs
            ->sortByDesc(fn ($tech) => $tech->pivot->years_experience)
            ->map(fn ($tech) => [
                'id' => $tech->id,
                'name' => $tech->name,
                'slug' => $tech->slug,
                'years' => $tech->pivot->years_experience,
            ])->toArray();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'bio' => $user->bio,
            'avatar' => $user->avatar,
            'created_at' => $user->created_at?->toISOString(),
            'createdProjects' => $createdProjects,
            'participatingProjects' => $participatingProjects,
            'techs' => $techs,
        ];
    }
}