<?php

namespace App\Http\Middleware;

use App\Helpers\StorageUrlHelper;
use App\Models\Tech;
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
            $userData['unread_notifications_count'] = $user->unreadNotifications()->count();

            $userData['avatar'] = StorageUrlHelper::url($userData['avatar'] ?? null);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'techs' => Tech::orderBy('name')->get(),
        ];
    }
}
