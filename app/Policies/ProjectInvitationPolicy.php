<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;

final class ProjectInvitationPolicy
{
    /**
     * Determine whether the user can create an invitation for the project.
     */
    public function create(User $user, Project $project): bool
    {
        return $project->user_id === $user->id;
    }

    /**
     * Determine whether the user can cancel the invitation.
     */
    public function cancel(User $user, ProjectInvitation $projectInvitation): bool
    {
        return $projectInvitation->project->user_id === $user->id;
    }

    /**
     * Determine whether the invited user can accept the invitation.
     */
    public function accept(User $user, ProjectInvitation $projectInvitation): bool
    {
        return $projectInvitation->status === ProjectInvitation::STATUS_PENDING
            && $projectInvitation->invited_user_id === $user->id;
    }

    /**
     * Determine whether the invited user can reject the invitation.
     */
    public function reject(User $user, ProjectInvitation $projectInvitation): bool
    {
        return $projectInvitation->status === ProjectInvitation::STATUS_PENDING
            && $projectInvitation->invited_user_id === $user->id;
    }
}
