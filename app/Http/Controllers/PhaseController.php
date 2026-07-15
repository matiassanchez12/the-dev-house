<?php

namespace App\Http\Controllers;

use App\Http\Requests\Phase\StorePhaseRequest;
use App\Http\Requests\Phase\UpdatePhaseRequest;
use App\Models\Phase;
use App\Models\Project;
use App\Services\PhaseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class PhaseController extends Controller
{
    public function __construct(
        private readonly PhaseService $phaseService,
    ) {}

    public function store(StorePhaseRequest $request, Project $project): RedirectResponse
    {
        Gate::authorize('create', [Phase::class, $project]);

        $this->phaseService->create($project, $request->validated(), $request->file('image'));

        return redirect()->route('projects.show', $project)
            ->with('success', 'Hito creado exitosamente.');
    }

    public function update(UpdatePhaseRequest $request, Project $project, Phase $phase): RedirectResponse
    {
        Gate::authorize('update', $phase);

        $this->phaseService->update($phase, $request->validated(), $request->file('image'));

        return redirect()->route('projects.show', $project)
            ->with('success', 'Hito actualizado exitosamente.');
    }

    public function destroy(Project $project, Phase $phase): RedirectResponse
    {
        Gate::authorize('delete', $phase);

        $this->phaseService->delete($phase);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Hito eliminado exitosamente.');
    }
}
