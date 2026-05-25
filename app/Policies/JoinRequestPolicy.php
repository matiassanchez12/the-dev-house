<?php

namespace App\Policies;

use App\Models\JoinRequest;
use App\Models\User;

class JoinRequestPolicy
{
    /**
     * Determine whether the user can approve the join request.
     * Only the project owner can approve.
     */
    public function approve(User $user, JoinRequest $joinRequest): bool
    {
        return $joinRequest->project->user_id === $user->id;
    }

    /**
     * Determine whether the user can reject the join request.
     * Only the project owner can reject.
     */
    public function reject(User $user, JoinRequest $joinRequest): bool
    {
        return $joinRequest->project->user_id === $user->id;
    }

    /**
     * Determine whether the user can cancel the join request.
     * Only the applicant (sender) can cancel.
     */
    public function cancel(User $user, JoinRequest $joinRequest): bool
    {
        return $joinRequest->user_id === $user->id;
    }
}