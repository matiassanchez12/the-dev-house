<?php

namespace App\Services;

use App\Models\JoinRequest;
use App\Models\User;
use Illuminate\Support\Collection;

class DashboardService
{
    /**
     * Get consolidated dashboard data for a user.
     *
     * @return array{
     *     stats: array{
     *         projects_created: int,
     *         projects_joined: int,
     *         pending_requests_received: int,
     *         requests_approved: int
     *     },
     *     createdProjects: Collection,
     *     participatingProjects: Collection,
     *     pendingRequests: Collection,
     *     sentRequests: Collection
     * }
     */
    public function getDashboardData(User $user): array
    {
        // Statistics
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

        // Created projects (as creator)
        $createdProjects = $user->createdProjects()
            ->with(['techs', 'participants'])
            ->withCount(['joinRequests' => function ($q) {
                $q->where('status', 'pending');
            }])
            ->latest()
            ->limit(5)
            ->get();

        // Participating projects
        $participatingProjects = $user->participatingProjects()
            ->with(['creator', 'techs'])
            ->withPivot('role', 'joined_at')
            ->latest('pivot_joined_at')
            ->limit(5)
            ->get();

        // Pending requests received (as project owner)
        $pendingRequests = JoinRequest::with(['applicant', 'project'])
            ->whereHas('project', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get();

        // Sent pending requests
        $sentRequests = JoinRequest::with(['project'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->limit(3)
            ->get();

        return [
            'stats' => $stats,
            'createdProjects' => $createdProjects,
            'participatingProjects' => $participatingProjects,
            'pendingRequests' => $pendingRequests,
            'sentRequests' => $sentRequests,
            'isOnboardingComplete' => $user->hasCompletedOnboarding(),
        ];
    }
}