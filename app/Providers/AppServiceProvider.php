<?php

namespace App\Providers;

use App\Models\JoinRequest;
use App\Models\Phase;
use App\Models\Project;
use App\Policies\JoinRequestPolicy;
use App\Policies\PhasePolicy;
use App\Policies\ProjectPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        Gate::policy(Phase::class, PhasePolicy::class);

        Vite::prefetch(concurrency: 3);
    }
}
