<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ProjectStatusController extends Controller
{
    public function __construct(
        private readonly ProjectService $projectService,
    ) {}

    public function update(Request $request, Project $project): RedirectResponse
    {
        Gate::authorize('updateStatus', $project);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', ProjectStatus::values())],
        ]);

        $newStatus = ProjectStatus::tryFrom($validated['status']);

        try {
            $this->projectService->updateStatus($project, $newStatus);
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'status' => $e->getMessage(),
            ]);
        }

        return redirect()->back()->with('success', __('Project status updated to :status', [
            'status' => $newStatus->value,
        ]));
    }
}
