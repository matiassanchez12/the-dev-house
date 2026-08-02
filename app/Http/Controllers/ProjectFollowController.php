<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Services\Exceptions\SelfFollowException;
use App\Services\ProjectFollowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

final class ProjectFollowController extends Controller
{
    public function __construct(
        private readonly ProjectFollowService $projectFollowService,
    ) {
    }

    public function store(Project $project): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        try {
            $this->projectFollowService->follow($project, $user);
        } catch (SelfFollowException) {
            return back()->withErrors([
                'follow' => 'You cannot follow your own project.',
            ]);
        }

        return back();
    }

    public function destroy(Project $project): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $this->projectFollowService->unfollow($project, $user);

        return back();
    }
}
