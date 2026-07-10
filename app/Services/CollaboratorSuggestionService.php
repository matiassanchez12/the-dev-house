<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final class CollaboratorSuggestionService
{
    public function isEligibleForProject(Project $project, int $userId): bool
    {
        $matchingTechIds = $project->techs()->pluck('techs.id');

        if ($matchingTechIds->isEmpty()) {
            return false;
        }

        return User::query()
            ->whereKey($userId)
            ->where('id', '!=', $project->user_id)
            ->whereHas('techs', fn (Builder $query) => $query->whereIn('techs.id', $matchingTechIds))
            ->whereDoesntHave('participatingProjects', fn (Builder $query) => $query->where('projects.id', $project->id))
            ->whereDoesntHave('receivedInvitations', fn (Builder $query) => $query
                ->where('project_id', $project->id)
                ->where('status', ProjectInvitation::STATUS_PENDING))
            ->exists();
    }

    public function forProject(Project $project, int $limit = 12): Collection
    {
        $matchingTechIds = $project->techs()->pluck('techs.id');

        if ($matchingTechIds->isEmpty()) {
            return collect();
        }

        $users = User::query()
            ->where('id', '!=', $project->user_id)
            ->whereHas('techs', fn (Builder $query) => $query->whereIn('techs.id', $matchingTechIds))
            ->whereDoesntHave('participatingProjects', fn (Builder $query) => $query->where('projects.id', $project->id))
            ->whereDoesntHave('receivedInvitations', fn (Builder $query) => $query
                ->where('project_id', $project->id)
                ->where('status', ProjectInvitation::STATUS_PENDING))
            ->with(['techs' => fn ($query) => $query->whereIn('techs.id', $matchingTechIds)])
            ->orderBy('name')
            ->limit($limit)
            ->get();

        return $users->map(static function (User $user) use ($matchingTechIds): array {
            $matchingTechs = $user->techs
                ->filter(fn ($tech) => $matchingTechIds->contains($tech->id))
                ->values()
                ->all();

            return [
                'user' => $user,
                'matching_techs' => $matchingTechs,
                'pending_invitation' => null,
            ];
        })->values();
    }
}
