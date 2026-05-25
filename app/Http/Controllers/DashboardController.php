<?php

namespace App\Http\Controllers;

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

        return Inertia::render('Dashboard', $data);
    }
}