<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Services\ProjectInvitationService;
use Illuminate\Http\RedirectResponse;
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

    public function accept(ProjectInvitation $projectInvitation): RedirectResponse
    {
        Gate::authorize('accept', $projectInvitation);

        $project = $projectInvitation->project;

        $this->projectInvitationService->accept($projectInvitation);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Invitation accepted successfully.');
    }

    public function reject(ProjectInvitation $projectInvitation): RedirectResponse
    {
        Gate::authorize('reject', $projectInvitation);

        $project = $projectInvitation->project;

        $this->projectInvitationService->reject($projectInvitation);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Invitation rejected successfully.');
    }
}
