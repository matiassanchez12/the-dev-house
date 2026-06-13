<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProjectChatController extends Controller
{
    public function index(Project $project)
    {
        Gate::authorize('viewChat', $project);

        $project->load(['messages.sender', 'creator', 'participants']);

        return Inertia::render('projects/chat', [
            'project' => ApiResourceTransformer::project($project),
        ]);
    }
}
