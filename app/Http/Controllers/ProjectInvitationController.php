<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Services\ProjectInvitationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class ProjectInvitationController extends Controller
{
    public function __construct(
        private readonly ProjectInvitationService $projectInvitationService,
    ) {}

    public function store(Request $request, Project $project)
    {
        Gate::authorize('create', [ProjectInvitation::class, $project]);

        $validated = $request->validate([
            'invited_user_id' => ['required', 'integer', 'exists:users,id'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $this->projectInvitationService->create(
            $project,
            (int) $validated['invited_user_id'],
            $validated['message'] ?? null,
        );

        return redirect()->route('projects.collaborators', $project)
            ->with('success', 'Invitation sent successfully.');
    }

    public function destroy(ProjectInvitation $projectInvitation)
    {
        Gate::authorize('cancel', $projectInvitation);

        $project = $projectInvitation->project;
        $this->projectInvitationService->cancel($projectInvitation);

        return redirect()->route('projects.collaborators', $project)
            ->with('success', 'Invitation cancelled successfully.');
    }
}
