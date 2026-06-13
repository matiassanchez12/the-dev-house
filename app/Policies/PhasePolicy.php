<?php

namespace App\Policies;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;

class PhasePolicy
{
    public function view(User $user, Phase $phase): bool
    {
        return $phase->project->isMember($user);
    }

    public function create(User $user, Project $project): bool
    {
        return $project->user_id === $user->id;
    }

    public function update(User $user, Phase $phase): bool
    {
        return $phase->project->user_id === $user->id;
    }

    public function delete(User $user, Phase $phase): bool
    {
        return $this->update($user, $phase);
    }
}
