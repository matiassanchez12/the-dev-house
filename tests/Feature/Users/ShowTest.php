<?php

namespace Tests\Feature\Users;

use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Profile page renders hero layout with stats row and tech groups
     *
     * Scenario: User with projects and techs views their profile
     * Expected: Hero section, stats row, and tech groups render with correct data
     */
    public function test_profile_page_renders_hero_layout(): void
    {
        // Arrange
        $user = User::factory()->create([
            'name' => 'Juan Pérez',
            'bio' => 'Desarrollador full-stack',
        ]);

        $react = Tech::factory()->create(['name' => 'React']);
        $laravel = Tech::factory()->create(['name' => 'Laravel']);

        $user->techs()->attach($react->id, ['years_experience' => 5, 'proficiency' => 'expert']);
        $user->techs()->attach($laravel->id, ['years_experience' => 3, 'proficiency' => 'advanced']);

        $project = Project::factory()->create([
            'user_id' => $user->id,
            'title' => 'Mi Proyecto',
            'slug' => 'mi-proyecto',
            'status' => 'open',
        ]);
        $project->techs()->attach($react->id);

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('user')
                ->where('user.name', 'Juan Pérez')
                ->where('user.bio', 'Desarrollador full-stack')
                ->has('user.createdProjects', 1)
                ->has('user.techs', 2)
        );

        // Verify stats data is present
        $props = $response->viewData('page')['props'];
        $this->assertCount(1, $props['user']['createdProjects']);
        $this->assertCount(0, $props['user']['participatingProjects']);
        $this->assertCount(2, $props['user']['techs']);
    }

    /**
     * Test: Profile page shows empty state for no projects
     *
     * Scenario: User with no projects views their profile
     * Expected: Empty component renders when user has no projects
     */
    public function test_profile_page_shows_empty_state_for_no_projects(): void
    {
        // Arrange
        $user = User::factory()->create([
            'name' => 'Empty User',
            'bio' => 'No projects yet',
        ]);

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('user.createdProjects', [])
                ->where('user.participatingProjects', [])
        );

        $props = $response->viewData('page')['props'];
        $this->assertEmpty($props['user']['createdProjects']);
        $this->assertEmpty($props['user']['participatingProjects']);
    }
}
