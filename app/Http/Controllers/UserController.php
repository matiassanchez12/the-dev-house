<?php

namespace App\Http\Controllers;

use App\Helpers\StorageUrlHelper;
use App\Models\Tech;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    /**
     * Transform user avatar to full URL.
     */
    private function transformUser(User $user): array
    {
        $user = $user->toArray();
        if (isset($user['avatar'])) {
            $user['avatar'] = StorageUrlHelper::url($user['avatar']);
        }
        return $user;
    }

    /**
     * Display the user discovery directory.
     */
    public function index(Request $request)
    {
        $filters = [
            'q' => $request->query('q'),
            'tech' => $request->query('tech'),
        ];

        $users = $this->userService->getDiscoverableUsers($filters);
        $techs = Tech::orderBy('name')->get(['id', 'name', 'slug']);

        $transformedUsers = $users->map(fn($u) => $this->transformUser($u));

        return Inertia::render('users/index', [
            'users' => $transformedUsers->toArray(),
            'techs' => $techs,
            'filters' => $filters,
        ]);
    }

    /**
     * Display a user's public profile.
     */
    public function show(User $user)
    {
        $userData = $this->userService->getPublicProfile($user);

        return Inertia::render('users/show', [
            'user' => $this->transformUser($userData),
        ]);
    }
}