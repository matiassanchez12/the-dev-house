<?php

namespace App\Http\Controllers;

use App\Helpers\StorageUrlHelper;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Transform project images and creator avatars to full URLs.
     */
    private function transformProject(Project $project): array
    {
        $project = $project->toArray();
        $images = $project['images'] ?? [];
        $project['images'] = array_map(fn($img) => StorageUrlHelper::url($img), $images);

        if (isset($project['creator']['avatar'])) {
            $project['creator']['avatar'] = StorageUrlHelper::url($project['creator']['avatar']);
        }

        return $project;
    }

    /**
     * Landing page principal
     */
    public function __invoke(Request $request)
    {
        // Obtener proyectos destacados (los últimos 6)
        $projects = Project::with(['creator', 'techs'])
            ->where('status', 'open')
            ->latest()
            ->limit(6)
            ->get();

        $transformedProjects = $projects->map(fn($p) => $this->transformProject($p));

        return Inertia::render('landing', [
            'user_count' => User::count(),
            'project_count' => Project::count(),
            'collaboration_count' => DB::table('project_participants')->count(),
            'projects' => [
                'data' => $transformedProjects->toArray(),
                'total' => Project::where('status', 'open')->count(),
            ],
        ]);
    }
}
