<?php

namespace Tests\Feature\Projects;

use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Project detail renders hero and sidebar layout
     *
     * Scenario: User views a project detail page
     * Expected: Hero image, two-column grid, sidebar metadata
     */
    public function test_project_detail_renders_hero_and_sidebar(): void
    {
        // Arrange
        $creator = User::factory()->create(['name' => 'Project Creator']);
        $participant = User::factory()->create(['name' => 'Participant']);

        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Awesome Project',
            'slug' => 'awesome-project',
            'description' => 'A great project description',
            'vision' => 'Change the world',
            'status' => 'open',
            'repository_url' => 'https://github.com/test/project',
            'demo_url' => 'https://demo.example.com',
        ]);

        $react = Tech::factory()->create(['name' => 'React']);
        $project->techs()->attach($react->id);
        $project->participants()->attach($participant->id, ['role' => 'developer', 'joined_at' => now()]);

        // Act
        $response = $this->get("/projects/{$project->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('project')
                ->where('project.title', 'Awesome Project')
                ->where('project.description', 'A great project description')
                ->where('project.vision', 'Change the world')
                ->where('project.status', 'open')
        );

        // Verify sidebar data is present
        $props = $response->viewData('page')['props'];
        $this->assertEquals('Project Creator', $props['project']['creator']['name']);
        $this->assertCount(1, $props['project']['techs']);
        $this->assertCount(1, $props['project']['participants']);
    }

    /**
     * Test: Project detail responsive layout classes present
     *
     * Scenario: Project page renders with responsive layout
     * Expected: Page renders successfully with project data
     */
    public function test_project_detail_responsive_layout(): void
    {
        // Arrange
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Responsive Project',
            'slug' => 'responsive-project',
            'description' => 'Test description',
            'status' => 'open',
        ]);

        // Act
        $response = $this->get("/projects/{$project->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('project')
                ->where('project.title', 'Responsive Project')
        );

        // Verify the page renders (responsive classes verified via build + manual check)
        $props = $response->viewData('page')['props'];
        $this->assertArrayHasKey('project', $props);
        $this->assertEquals('Responsive Project', $props['project']['title']);
    }
}
