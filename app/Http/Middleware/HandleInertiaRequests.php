<?php

namespace App\Http\Middleware;

use App\Helpers\StorageUrlHelper;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $userData = null;
        $user = $request->user();

        if ($user) {
            $userData = $user->only(['id', 'name', 'slug', 'bio', 'avatar']);

            if ($user->avatar) {
                $userData['avatar_url'] = StorageUrlHelper::url($user->avatar);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
        ];
    }
}
