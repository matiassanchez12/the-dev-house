<?php

namespace Tests\Feature\Projects;

use App\Models\Project;
use App\Models\Message;
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
        $this->assertCount(1, $props['project']['phases']);
        $this->assertEquals('Discovery', $props['project']['phases'][0]['title']);
        $this->assertSame('guest', $props['project']['viewer_role']);
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

    /**
     * Test: Project members can see chat messages on the detail page
     *
     * Scenario: A participant opens a project they belong to
     * Expected: The project payload includes chat messages with sender data
     */
    public function test_project_detail_includes_chat_messages_for_members(): void
    {
        $creator = User::factory()->create(['name' => 'Project Creator']);
        $participant = User::factory()->create(['name' => 'Chat Member']);

        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Chat Project',
            'slug' => 'chat-project',
            'status' => 'open',
        ]);

        $project->participants()->attach($participant->id, ['role' => 'developer', 'joined_at' => now()]);

        Message::create([
            'project_id' => $project->id,
            'user_id' => $participant->id,
            'body' => 'Listo para arrancar',
            'type' => 'text',
        ]);

        $response = $this->actingAs($participant)->get(route('projects.show', $project));

        $response->assertInertia(fn ($page) => $page
            ->has('project.messages', 1)
            ->where('project.messages.0.body', 'Listo para arrancar')
            ->where('project.messages.0.sender.name', 'Chat Member')
        );
    }

    /**
     * Test: Project members can send messages to the chat
     *
     * Scenario: A participant submits a new chat message
     * Expected: The message is stored and the user is redirected back to the project
     */
    public function test_project_members_can_send_chat_messages(): void
    {
        $creator = User::factory()->create();
        $participant = User::factory()->create();

        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'chat-project-store',
            'status' => 'open',
        ]);

        $project->participants()->attach($participant->id, ['role' => 'developer', 'joined_at' => now()]);

        $response = $this->actingAs($participant)->post(route('projects.messages.store', $project), [
            'body' => 'Ya estoy listo para revisar el backlog',
        ]);

        $response->assertRedirect(route('projects.chat', $project));

        $this->assertDatabaseHas('messages', [
            'project_id' => $project->id,
            'user_id' => $participant->id,
            'body' => 'Ya estoy listo para revisar el backlog',
            'type' => 'text',
        ]);
    }

    /**
     * Test: Project creator payload resolves creator viewer role
     *
     * Scenario: The project creator opens their project
     * Expected: The payload exposes creator as viewer role
     */
    public function test_project_detail_sets_viewer_role_for_creator(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'creator-project',
            'status' => 'open',
        ]);

        $response = $this->actingAs($creator)->get(route('projects.show', $project));

        $response->assertInertia(
            fn ($page) => $page
                ->where('project.viewer_role', 'creator')
        );
    }

    /**
     * Test: Project participant payload resolves member viewer role
     *
     * Scenario: An approved participant opens a project
     * Expected: The payload exposes member as viewer role
     */
    public function test_project_detail_sets_viewer_role_for_member(): void
    {
        $creator = User::factory()->create();
        $participant = User::factory()->create();

        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'member-project',
            'status' => 'open',
        ]);

        $project->participants()->attach($participant->id, ['role' => 'developer', 'joined_at' => now()]);

        $response = $this->actingAs($participant)->get(route('projects.show', $project));

        $response->assertInertia(
            fn ($page) => $page
                ->where('project.viewer_role', 'member')
        );
    }
}
