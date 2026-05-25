<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

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