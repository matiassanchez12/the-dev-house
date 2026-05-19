<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
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

        return Inertia::render('Landing', [
            'projects' => [
                'data' => $projects,
                'total' => Project::where('status', 'open')->count(),
            ],
        ]);
    }
}
