<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Services\Exceptions\SelfFollowException;
use Illuminate\Support\Facades\DB;

final class ProjectFollowService
{
    public function follow(Project $project, User $user): void
    {
        $this->guardAgainstSelfFollow($project, $user);

        $timestamp = now();

        // Upsert keeps duplicate follow submits idempotent.
        $project->followers()->newPivotStatement()->updateOrInsert(
            [
                'project_id' => $project->id,
                'user_id' => $user->id,
            ],
            [
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        );
    }

    public function unfollow(Project $project, User $user): void
    {
        $project->followers()->detach($user->id);
    }

    public function isFollowing(Project $project, User $user): bool
    {
        return $project->followers()->whereKey($user->id)->exists();
    }

    public function hasUnreadPublicUpdates(Project $project, User $user): bool
    {
        return $this->unreadFlagsForProjects([$project->id], $user)[$project->id] ?? false;
    }

    /**
     * @param array<int> $projectIds
     *
     * @return array<int, bool>
     */
    public function unreadFlagsForProjects(array $projectIds, User $user): array
    {
        $projectIds = array_values(array_unique(array_map('intval', $projectIds)));

        if ($projectIds === []) {
            return [];
        }

        $flags = array_fill_keys($projectIds, false);

        $notifications = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', User::class)
            ->whereNull('read_at')
            ->where('type', 'App\\Notifications\\ProjectUpdateNotification')
            ->pluck('data');

        foreach ($notifications as $notificationData) {
            $data = is_string($notificationData) ? json_decode($notificationData, true) : $notificationData;
            $projectId = (int) ($data['project_id'] ?? 0);

            if ($projectId > 0 && array_key_exists($projectId, $flags)) {
                $flags[$projectId] = true;
            }
        }

        return $flags;
    }

    private function guardAgainstSelfFollow(Project $project, User $user): void
    {
        if ($project->user_id === $user->id) {
            $project->followers()->detach($user->id);

            throw new SelfFollowException();
        }
    }
}
