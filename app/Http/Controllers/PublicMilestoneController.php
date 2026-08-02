<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Phase;
use App\Services\ProjectFollowService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PublicMilestoneController extends Controller
{
    public function __construct(
        private ProjectFollowService $projectFollowService,
    ) {}

    public function index()
    {
        $milestones = Phase::query()
            ->with(['project.creator'])
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $viewer = Auth::user();
        $projectIds = $milestones->getCollection()->pluck('project_id')->unique()->values()->all();
        $unreadFlags = [];

        if ($viewer !== null) {
            $unreadFlags = $this->projectFollowService->unreadFlagsForProjects($projectIds, $viewer);
        }

        if ($viewer !== null) {
            $milestones->getCollection()->each(function (Phase $phase) use ($unreadFlags): void {
                $phase->project?->setAttribute(
                    'has_unread_public_updates',
                    $unreadFlags[$phase->project_id] ?? false,
                );
            });
        }

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
