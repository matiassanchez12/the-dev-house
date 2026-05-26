<?php

namespace App\Services;

use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;

class OnboardingService
{
    private const PROFICIENCY_MAP = [
        1 => 'basic',
        2 => 'intermediate',
        3 => 'advanced',
        4 => 'expert',
        5 => 'master',
    ];

    public function saveTechs(User $user, array $techs): void
    {
        $syncData = [];
        foreach ($techs as $tech) {
            $proficiency = self::PROFICIENCY_MAP[$tech['proficiency']] ?? 'advanced';
            $syncData[$tech['id']] = ['proficiency' => $proficiency];
        }
        $user->techs()->sync($syncData);
    }

    public function saveBio(User $user, ?string $bio): void
    {
        $user->update(['bio' => $bio]);
    }

    public function saveAvatar(User $user, $file): ?string
    {
        if (!$file) return null;

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $file->store('avatars', 'public');
        $user->update(['avatar' => $path]);
        return $path;
    }

    public function getRecommendations(User $user, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        $userTechIds = $user->techs()->pluck('techs.id')->toArray();

        if (empty($userTechIds)) {
            return Project::where('status', 'open')
                ->with(['techs', 'creator'])
                ->limit($limit)
                ->get();
        }

        return Project::where('status', 'open')
            ->whereHas('techs', function ($query) use ($userTechIds) {
                $query->whereIn('techs.id', $userTechIds);
            })
            ->with(['techs', 'creator'])
            ->limit($limit)
            ->get();
    }

    public function complete(User $user): void
    {
        $user->update(['onboarding_completed_at' => now()]);
    }

    public function sendJoinRequests(User $user, array $projectIds): void
    {
        foreach ($projectIds as $projectId) {
            $project = Project::find($projectId);
            if (!$project || $project->user_id === $user->id) continue;

            $exists = \App\Models\JoinRequest::where('user_id', $user->id)
                ->where('project_id', $projectId)
                ->exists();

            if (!$exists) {
                \App\Models\JoinRequest::create([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                    'status' => 'pending',
                    'message' => 'Interested in this project from onboarding',
                ]);
            }
        }
    }
}
