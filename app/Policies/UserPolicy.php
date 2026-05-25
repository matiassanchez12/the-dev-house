<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the user profile.
     * Public profiles are always viewable by anyone.
     */
    public function view(User $user, User $targetUser): bool
    {
        return true;
    }
}