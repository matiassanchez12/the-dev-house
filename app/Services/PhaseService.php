<?php

namespace App\Services;

use App\Models\Phase;
use App\Models\Project;
use Illuminate\Support\Collection;

class PhaseService
{
    public function create(Project $project, array $data): Phase
    {
        return $project->phases()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
        ]);
    }

    public function update(Phase $phase, array $data): Phase
    {
        $phase->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
        ]);

        return $phase->refresh();
    }

    public function delete(Phase $phase): void
    {
        $phase->delete();
    }

    public function listFor(Project $project): Collection
    {
        return $project->phases()->orderBy('created_at')->get();
    }
}
