<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
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
     * Dashboard principal del usuario
     */
    public function __invoke(Request $request)
    {
        $data = $this->dashboardService->getDashboardData(Auth::user());

        $data['createdProjects'] = ApiResourceTransformer::projects($data['createdProjects']);
        $data['participatingProjects'] = ApiResourceTransformer::projects($data['participatingProjects']);
        $data['pendingRequests'] = ApiResourceTransformer::joinRequests($data['pendingRequests']);
        $data['sentRequests'] = ApiResourceTransformer::joinRequests($data['sentRequests']);

        return Inertia::render('dashboard', $data);
    }
}