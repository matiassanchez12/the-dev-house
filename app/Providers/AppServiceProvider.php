<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\JoinRequest;
use App\Models\Phase;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Policies\JoinRequestPolicy;
use App\Policies\PhasePolicy;
use App\Policies\ProjectInvitationPolicy;
use App\Policies\ProjectPolicy;
use Illuminate\Broadcasting\Broadcasters\PusherBroadcaster;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Pusher\Pusher;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(JoinRequest::class, JoinRequestPolicy::class);
        Gate::policy(ProjectInvitation::class, ProjectInvitationPolicy::class);
        Gate::policy(Phase::class, PhasePolicy::class);

        if ($this->app->environment('testing')) {
            Broadcast::extend('testing', function (): PusherBroadcaster {
                $fakePusher = new class(
                    config('broadcasting.connections.testing.key'),
                    config('broadcasting.connections.testing.secret'),
                    config('broadcasting.connections.testing.app_id'),
                ) extends Pusher {
                    public function __construct(string $authKey, string $secret, string $appId)
                    {
                        parent::__construct($authKey, $secret, $appId);
                    }

                    public function trigger($channels, string $event, $data, array $params = [], bool $already_encoded = false): object
                    {
                        return (object) [];
                    }
                };

                return new PusherBroadcaster($fakePusher);
            });
        }

        Vite::useBuildDirectory('build-assets');
        Vite::prefetch(concurrency: 3);
    }
}
