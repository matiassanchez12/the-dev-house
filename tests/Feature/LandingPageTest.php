<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_returns_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('landing')
        );
    }

    public function test_landing_page_returns_real_db_counts(): void
    {
        // Create some users
        $users = User::factory()->count(5)->create();

        // Create some projects
        $projects = Project::factory()->count(3)->create(['user_id' => $users[0]->id]);

        // Create some collaborations (project_participants)
        DB::table('project_participants')->insert([
            ['project_id' => $projects[0]->id, 'user_id' => $users[1]->id, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $projects[0]->id, 'user_id' => $users[2]->id, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $projects[1]->id, 'user_id' => $users[3]->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->where('user_count', 5)
            ->where('project_count', 3)
            ->where('collaboration_count', 3)
        );
    }

    public function test_landing_page_includes_projects_regardless_of_status(): void
    {
        $user = User::factory()->create();

        Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'open',
            'title' => 'Open Project',
            'created_at' => now()->subDays(2),
        ]);

        Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed',
            'title' => 'Completed Project',
            'created_at' => now()->subDay(),
        ]);

        Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'closed',
            'title' => 'Closed Project',
            'created_at' => now(),
        ]);

        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->where('projects.total', 3)
            ->has('projects.data', 3)
            ->where('projects.data.0.title', 'Closed Project')
            ->where('projects.data.0.status', 'closed')
            ->where('projects.data.1.title', 'Completed Project')
            ->where('projects.data.1.status', 'completed')
            ->where('projects.data.2.title', 'Open Project')
            ->where('projects.data.2.status', 'open')
        );
    }

    public function test_landing_page_returns_zero_counts_when_empty(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->where('user_count', 0)
            ->where('project_count', 0)
            ->where('collaboration_count', 0)
        );
    }

    public function test_landing_page_renders_landing_component_not_welcome(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('projects.data')
            ->has('projects.total')
        );
    }

    public function test_landing_page_passes_techs_prop(): void
    {
        Tech::factory()->count(3)->sequence(
            ['name' => 'Go'],
            ['name' => 'Rust'],
            ['name' => 'Zig'],
        )->create();

        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('techs', 3)
            ->where('techs.0.name', 'Go')
            ->where('techs.1.name', 'Rust')
            ->where('techs.2.name', 'Zig')
        );
    }

    public function test_landing_hero_uses_fallback_when_techs_empty(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('techs', 0)
        );
    }

    public function test_landing_page_excludes_users_who_opted_out_of_discovery(): void
    {
        User::factory()->create(['name' => 'Visible User']);
        $hiddenUser = User::factory()->create(['name' => 'Hidden User']);
        $hiddenUser->privacySetting()->create(['is_discoverable' => false]);

        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('users', 1)
            ->where('users.0.name', 'Visible User')
        );
    }
}
