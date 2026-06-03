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
}
