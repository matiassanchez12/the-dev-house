<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Services\JoinRequestService;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private JoinRequestService $joinRequestService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Project::with(['creator', 'techs'])
            ->latest();

        // Filtro por tech
        if ($request->filled('tech')) {
            $query->whereHas('techs', function ($q) use ($request) {
                $q->where('slug', $request->tech);
            });
        }

        // Filtro por estado
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por búsqueda (title, case-insensitive, substring)
        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->whereRaw('LOWER(title) LIKE LOWER(?)', ['%' . $search . '%']);
        }

        $paginator = $query->paginate(12)->withQueryString();

        return Inertia::render('projects/index', [
            'projects' => [
                'data' => ApiResourceTransformer::projects(collect($paginator->items())),
                'links' => $paginator->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
            'filters' => [
                'tech' => $request->tech,
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('projects/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $project = $this->projectService->create(
            Auth::user(),
            $request->validated()
        );

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proyecto creado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $project->load(['creator.techs', 'techs', 'participants']);

        if (Auth::check() && $project->isMember(Auth::user())) {
            $project->load(['messages.sender']);
        }
        $viewerJoinRequest = null;

        if (Auth::check()) {
            $viewerJoinRequest = $this->joinRequestService
                ->getViewerPendingRequest($project, Auth::user());
        }

        return Inertia::render('projects/show', [
            'project' => ApiResourceTransformer::project($project, $viewerJoinRequest),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        Gate::authorize('update', $project);

        $project->load(['creator.techs', 'techs']);

        return Inertia::render('projects/edit', [
            'project' => ApiResourceTransformer::project($project),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        Gate::authorize('update', $project);

        $project = $this->projectService->update($project, $request->validated());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proyecto actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        Gate::authorize('delete', $project);

        $this->projectService->delete($project);

        return redirect()->route('projects.index')
            ->with('success', 'Proyecto eliminado exitosamente!');
    }
}
