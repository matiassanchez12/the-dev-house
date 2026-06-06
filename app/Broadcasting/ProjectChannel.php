<?php

namespace App\Broadcasting;

use App\Models\User;
use App\Models\Project;

class ProjectChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     * 
     * Solo pueden acceder:
     * - El creator del proyecto
     * - Los participantes aprobados
     */
    public function join(User $user, int $projectId): array|bool
    {
        $project = Project::find($projectId);

        if (!$project) {
            return false;
        }

        if ($project->isMember($user)) {
            return $project->user_id === $user->id
                ? ['creator' => true]
                : ['participant' => true];
        }

        return false;
    }
}
