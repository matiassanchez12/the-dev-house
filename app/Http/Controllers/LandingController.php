<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LandingController extends Controller
{
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

        return Inertia::render('landing', [
            'user_count' => User::count(),
            'project_count' => Project::count(),
            'collaboration_count' => DB::table('project_participants')->count(),
            'projects' => [
                'data' => ApiResourceTransformer::projects($projects),
                'total' => Project::where('status', 'open')->count(),
            ],
        ]);
    }
}
