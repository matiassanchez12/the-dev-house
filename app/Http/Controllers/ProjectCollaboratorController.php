<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Services\CollaboratorSuggestionService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class ProjectCollaboratorController extends Controller
{
    public function __construct(
        private readonly CollaboratorSuggestionService $collaboratorSuggestionService,
    ) {}

    public function index(Project $project)
    {
        Gate::authorize('create', [ProjectInvitation::class, $project]);

        $project->load(['creator.techs', 'techs', 'participants']);

        $pendingInvitations = $project->invitations()
            ->where('status', ProjectInvitation::STATUS_PENDING)
            ->with(['invitedUser.techs'])
            ->latest()
            ->get();

        return Inertia::render('projects/collaborators', [
            'project' => ApiResourceTransformer::project($project),
            'suggestions' => ApiResourceTransformer::collaboratorSuggestions(
                $this->collaboratorSuggestionService->forProject($project),
            ),
            'pendingInvitations' => ApiResourceTransformer::projectInvitations($pendingInvitations),
        ]);
    }
}
