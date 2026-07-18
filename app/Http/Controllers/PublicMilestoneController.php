<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Phase;
use Inertia\Inertia;

class PublicMilestoneController extends Controller
{
    public function index()
    {
        $milestones = Phase::query()
            ->with(['project.creator'])
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('milestones', [
            'milestones' => [
                'data' => $milestones->getCollection()
                    ->map(fn (Phase $phase) => ApiResourceTransformer::phase($phase))
                    ->toArray(),
                'links' => $milestones->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $milestones->currentPage(),
                    'last_page' => $milestones->lastPage(),
                    'per_page' => $milestones->perPage(),
                    'total' => $milestones->total(),
                    'from' => $milestones->firstItem(),
                    'to' => $milestones->lastItem(),
                ],
            ],
        ]);
    }
}
