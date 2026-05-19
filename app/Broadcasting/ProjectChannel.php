<?php

namespace App\Broadcasting;

use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
     * - Usuarios con solicitudes pendientes (para ver updates)
     */
    public function join(User $user, int $projectId): array|bool
    {
        $project = Project::find($projectId);

        if (!$project) {
            return false;
        }

        // El creator siempre tiene acceso
        if ($project->user_id === $user->id) {
            return ['creator' => true];
        }

        // Participantes aprobados
        $isParticipant = $user->participatingProjects()
            ->where('project_id', $projectId)
            ->exists();

        if ($isParticipant) {
            return ['participant' => true];
        }

        // Usuarios con solicitudes pendientes
        $hasPendingRequest = $project->joinRequests()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPendingRequest) {
            return ['applicant' => true];
        }

        return false;
    }
}
