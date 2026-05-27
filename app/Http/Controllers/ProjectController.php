<?php

namespace App\Http\Controllers;

use App\Helpers\StorageUrlHelper;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\Tech;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    /**
     * Transform project images to full URLs.
     */
    private function transformProjectImages(Project $project): array
    {
        $images = $project->images ?? [];
        $project = $project->toArray();
        $project['images'] = array_map(fn($img) => StorageUrlHelper::url($img), $images);
        return $project;
    }

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

        $paginator = $query->paginate(12)->withQueryString();

        $techs = Tech::orderBy('name')->get();

        // Transform images to URLs
        $projects = collect($paginator->items())->map(fn($p) => $this->transformProjectImages($p));

        return Inertia::render('projects/index', [
            'projects' => [
                'data' => $projects->toArray(),
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
            'techs' => $techs,
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
        $techs = Tech::orderBy('name')->get();

        return Inertia::render('projects/create', [
            'techs' => $techs,
        ]);
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

        return Inertia::render('projects/show', [
            'project' => $this->transformProjectImages($project),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        Gate::authorize('update', $project);

        $techs = Tech::orderBy('name')->get();

        $project->load(['creator.techs', 'techs']);

        return Inertia::render('projects/edit', [
            'project' => $this->transformProjectImages($project),
            'techs' => $techs,
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