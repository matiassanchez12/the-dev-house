<?php

namespace App\Http\Controllers;

use App\Helpers\StorageUrlHelper;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Transform project images to full URLs.
     */
    private function transformProject($project): array
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
     * Transform request applicant avatar.
     */
    private function transformRequest($request): array
    {
        $request = $request->toArray();
        if (isset($request['applicant']['avatar'])) {
            $request['applicant']['avatar'] = StorageUrlHelper::url($request['applicant']['avatar']);
        }
        if (isset($request['project']['images'])) {
            $images = $request['project']['images'] ?? [];
            $request['project']['images'] = array_map(fn($img) => StorageUrlHelper::url($img), $images);
        }
        return $request;
    }

    /**
     * Dashboard principal del usuario
     */
    public function __invoke(Request $request)
    {
        $data = $this->dashboardService->getDashboardData(Auth::user());

        // Transform projects and requests
        $data['createdProjects'] = $data['createdProjects']->map(fn($p) => $this->transformProject($p));
        $data['participatingProjects'] = $data['participatingProjects']->map(fn($p) => $this->transformProject($p));
        $data['pendingRequests'] = $data['pendingRequests']->map(fn($r) => $this->transformRequest($r));
        $data['sentRequests'] = $data['sentRequests']->map(fn($r) => $this->transformRequest($r));

        return Inertia::render('dashboard', $data);
    }
}