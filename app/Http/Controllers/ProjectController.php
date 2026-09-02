<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\ProjectIdea;
use App\Models\ProjectInvitation;
use App\Services\JoinRequestService;
use App\Services\ProjectFollowService;
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
        private ProjectFollowService $projectFollowService,
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
            $query->whereRaw('LOWER(title) LIKE LOWER(?)', ['%'.$search.'%']);
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
        $projectIdeas = ProjectIdea::published()
            ->with('techs:id')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('projects/create', [
            'projectIdeas' => ApiResourceTransformer::projectIdeas($projectIdeas),
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

        return redirect()->route('projects.collaborators', $project)
            ->with('success', 'Proyecto creado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $project->load(['creator.techs', 'techs', 'participants', 'phases']);
        $project->loadCount('followers');
        $project->load(['followers' => fn ($q) => $q->limit(3)]);
        $viewer = Auth::user();
        $viewerRole = $this->projectService->viewerRole($project, $viewer);

        if (Auth::check() && $project->isMember($viewer)) {
            $project->load(['messages.sender']);
        }
        $viewerJoinRequest = null;

        if ($viewer !== null) {
            $viewerJoinRequest = $this->joinRequestService
                ->getViewerFullRequest($project, $viewer);
        }

        $viewerPendingInvitation = null;

        if ($viewer !== null) {
            $isFollowing = $this->projectFollowService->isFollowing($project, $viewer);

            $viewerPendingInvitation = $viewer->receivedInvitations()
                ->where('project_id', $project->id)
                ->where('status', ProjectInvitation::STATUS_PENDING)
                ->latest()
                ->first();
            $project->setAttribute(
                'is_followed_by_viewer',
                $isFollowing
            );
            $project->setAttribute(
                'has_unread_public_updates',
                $isFollowing ? $this->projectFollowService->hasUnreadPublicUpdates($project, $viewer) : false,
            );
            $project->setAttribute('followers_preview', $project->followers->toArray());
        }

        return Inertia::render('projects/show', [
            'project' => ApiResourceTransformer::project(
                $project,
                $viewerJoinRequest,
                $viewerRole,
                $viewerPendingInvitation,
            ),
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
