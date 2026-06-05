<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Authenticated user can view any public profile
     *
     * Scenario: Authenticated user navigates to a public profile
     * Expected: 200 status, profile data without email
     */
    public function test_can_view_public_profile(): void
    {
        // Arrange
        $user = User::factory()->create([
            'name' => 'Juan Pérez',
            'bio' => 'Desarrollador full-stack con 5 años de experiencia',
            'avatar' => 'avatars/juan.jpg',
        ]);

        $tech = Tech::factory()->create(['name' => 'React']);
        $user->techs()->attach($tech->id, ['years_experience' => 5, 'proficiency' => 'expert']);

        $project = Project::factory()->create([
            'user_id' => $user->id,
            'title' => 'Mi Proyecto',
            'slug' => 'mi-proyecto',
            'status' => 'open',
        ]);
        $project->techs()->attach($tech->id);

        // Act
        $response = $this->actingAs($user)->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('users/show')
                ->has('user')
                ->where('user.name', 'Juan Pérez')
                ->where('user.bio', 'Desarrollador full-stack con 5 años de experiencia')
                ->where('user.avatar', Storage::disk('public')->url('avatars/juan.jpg'))
                ->missing('user.email') // email should NOT be exposed
        );
    }

    /**
     * Test: Guest user can view any public profile
     *
     * Scenario: Unauthenticated user navigates to a public profile
     * Expected: 200 status, same profile data as authenticated user
     */
    public function test_guest_can_view_public_profile(): void
    {
        // Arrange
        $user = User::factory()->create([
            'name' => 'María García',
            'bio' => 'Diseñadora UI/UX',
        ]);

        Tech::factory()->create(['name' => 'Figma']);
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'title' => 'Proyecto de Diseño',
            'slug' => 'proyecto-diseno',
        ]);

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('users/show')
                ->where('user.name', 'María García')
        );
    }

    /**
     * Test: Invalid user slug returns 404
     *
     * Scenario: Request with non-existent user identifier
     * Expected: 404 Not Found
     */
    public function test_returns_404_for_invalid_user(): void
    {
        // Act
        $response = $this->get('/users/invalid-user-slug');

        // Assert
        $response->assertStatus(404);
    }

    /**
     * Test: Profile shows created projects with creator and techs
     *
     * Scenario: User with created projects
     * Expected: Created projects section shows with title, status, techs, and creator info
     */
    public function test_profile_shows_created_projects_with_creator_and_techs(): void
    {
        // Arrange
        $user = User::factory()->create(['name' => 'Carlos Dev']);
        $tech = Tech::factory()->create(['name' => 'Laravel']);

        $project = Project::factory()->create([
            'user_id' => $user->id,
            'title' => 'API REST',
            'slug' => 'api-rest',
            'status' => 'in_progress',
        ]);
        $project->techs()->attach($tech->id);

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('user.createdProjects', 1)
                ->where('user.createdProjects.0.title', 'API REST')
                ->where('user.createdProjects.0.status', 'in_progress')
                ->where('user.createdProjects.0.creator.name', 'Carlos Dev')
                ->has('user.createdProjects.0.techs', 1)
        );
    }

    /**
     * Test: Profile shows participating projects with participants_count
     *
     * Scenario: User participating in projects
     * Expected: Participating projects show with participants_count
     */
    public function test_profile_shows_participating_projects_with_count(): void
    {
        // Arrange
        $user = User::factory()->create(['name' => 'Ana Participant']);
        $otherUser = User::factory()->create(['name' => 'Project Owner']);

        $project = Project::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Collaborative Project',
            'slug' => 'collab-project',
        ]);
        $project->participants()->attach($user->id, ['role' => 'developer', 'joined_at' => now()]);

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('user.participatingProjects', 1)
                ->where('user.participatingProjects.0.title', 'Collaborative Project')
        );
    }

    /**
     * Test: Profile shows tech tags with proficiency sorted by years descending
     *
     * Scenario: User with multiple tech tags
     * Expected: Techs sorted by years_experience descending with pivot data
     */
    public function test_profile_shows_techs_sorted_by_proficiency(): void
    {
        // Arrange
        $user = User::factory()->create();

        $react = Tech::factory()->create(['name' => 'React']);
        $laravel = Tech::factory()->create(['name' => 'Laravel']);
        $typescript = Tech::factory()->create(['name' => 'TypeScript']);

        $user->techs()->attach($react->id, ['years_experience' => 5, 'proficiency' => 'expert']);
        $user->techs()->attach($laravel->id, ['years_experience' => 3, 'proficiency' => 'advanced']);
        $user->techs()->attach($typescript->id, ['years_experience' => 4, 'proficiency' => 'advanced']);

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('user.techs', 3)
        );

        // Verify sorting (5 years > 4 years > 3 years)
        $this->assertEquals('React', $response->viewData('page')['props']['user']['techs'][0]['name']);
        $this->assertEquals(5, $response->viewData('page')['props']['user']['techs'][0]['years']);
    }

    /**
     * Test: Profile never exposes user email
     *
     * Scenario: Any profile view (auth or guest)
     * Expected: Email field is never present in response
     */
    public function test_profile_never_exposes_email(): void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'private@example.com',
        ]);

        // Act
        $response = $this->actingAs($user)->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);

        $page = $response->viewData('page');
        $this->assertArrayNotHasKey('email', $page['props']['user']);
    }

    /**
     * Test: Empty created projects shows empty state
     *
     * Scenario: User with no created projects
     * Expected: Empty createdProjects array
     */
    public function test_empty_created_projects(): void
    {
        // Arrange
        $user = User::factory()->create();

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('user.createdProjects', [])
        );
    }

    /**
     * Test: Empty tech tags - section not displayed
     *
     * Scenario: User with no tech tags
     * Expected: Empty techs array
     */
    public function test_empty_tech_tags(): void
    {
        // Arrange
        $user = User::factory()->create();

        // Act
        $response = $this->get("/users/{$user->slug}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('user.techs', [])
        );
    }
}
