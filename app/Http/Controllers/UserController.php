<?php

namespace App\Http\Controllers;

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

        return Inertia::render('users/index', [
            'users' => $users,
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
            'user' => $userData,
        ]);
    }
}