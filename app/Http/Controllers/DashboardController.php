<?php

namespace App\Http\Controllers;

use App\Models\JoinRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Dashboard principal del usuario
     */
    public function __invoke(Request $request)
    {
        $user = Auth::user();

        // === ESTADÍSTICAS ===
        $stats = [
            'projects_created' => $user->createdProjects()->count(),
            'projects_joined' => $user->participatingProjects()->count(),
            'pending_requests_received' => JoinRequest::whereHas('project', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->where('status', 'pending')
                ->count(),
            'requests_approved' => JoinRequest::where('user_id', $user->id)
                ->where('status', 'approved')
                ->count(),
        ];

        // === MIS PROYECTOS (como creator) ===
        $createdProjects = $user->createdProjects()
            ->with(['techs', 'participants'])
            ->withCount(['joinRequests' => function ($q) {
                $q->where('status', 'pending');
            }])
            ->latest()
            ->limit(5)
            ->get();

        // === PROYECTOS DONDE PARTICIPO ===
        $participatingProjects = $user->participatingProjects()
            ->with(['creator', 'techs'])
            ->withPivot('role', 'joined_at')
            ->latest('pivot_joined_at')
            ->limit(5)
            ->get();

        // === SOLICITUDES PENDIENTES (recibidas como creator) ===
        $pendingRequests = JoinRequest::with(['applicant', 'project'])
            ->whereHas('project', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get();

        // === SOLICITUDES ENVIADAS (pendientes de respuesta) ===
        $sentRequests = JoinRequest::with(['project'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->limit(3)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'createdProjects' => $createdProjects,
            'participatingProjects' => $participatingProjects,
            'pendingRequests' => $pendingRequests,
            'sentRequests' => $sentRequests,
        ]);
    }
}
