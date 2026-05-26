<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * TEST 1: Guest cannot access onboarding - redirect to login
     */
    public function test_guest_cannot_access_onboarding(): void
    {
        $response = $this->get('/onboarding');
        $response->assertRedirect('/login');
    }

    /**
     * TEST 2: User can view onboarding page - success response
     */
    public function test_user_can_view_onboarding_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/onboarding');
        $response->assertStatus(200);
    }

    /**
     * TEST 3: User can skip onboarding - sets onboarding_completed_at, redirects to dashboard
     */
    public function test_user_can_skip_onboarding(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/skip');
        $response->assertRedirect('/dashboard');

        $this->assertNotNull($user->fresh()->onboarding_completed_at);
    }

    /**
     * TEST 4: User can complete step 1 (techs) - saves to pivot
     */
    public function test_user_can_complete_step_1_techs(): void
    {
        $user = User::factory()->create();
        $tech = \App\Models\Tech::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-1', [
            'techs' => [['id' => $tech->id, 'proficiency' => '3']],
        ]);

        $response->assertRedirect('/onboarding');
        $this->assertDatabaseHas('user_tech', [
            'user_id' => $user->id,
            'tech_id' => $tech->id,
        ]);
    }

    /**
     * TEST 5: User can complete step 2 (bio) - saves bio
     */
    public function test_user_can_complete_step_2_bio(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-2', [
            'bio' => 'My bio text',
        ]);

        $response->assertRedirect('/onboarding');
        $this->assertEquals('My bio text', $user->fresh()->bio);
    }

    /**
     * TEST 6: User can complete step 4 (join requests) - creates join requests
     */
    public function test_user_can_complete_step_4_join_requests(): void
    {
        $user = User::factory()->create();
        $creator = User::factory()->create();
        $tech = \App\Models\Tech::factory()->create();

        $project = \App\Models\Project::factory()->create([
            'user_id' => $creator->id,
        ]);
        $project->techs()->attach($tech->id);

        $response = $this->actingAs($user)->post('/onboarding/step-4', [
            'join_requests' => [$project->id],
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('join_requests', [
            'user_id' => $user->id,
            'project_id' => $project->id,
        ]);
    }

    /**
     * TEST 7: Completed user redirected to dashboard - accessing /onboarding redirects
     */
    public function test_completed_user_redirected_to_dashboard(): void
    {
        $user = User::factory()->create([
            'onboarding_completed_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/onboarding');
        $response->assertRedirect('/dashboard');
    }

    /**
     * TEST 8: Recommendations returns matching projects
     */
    public function test_recommendations_returns_matching_projects(): void
    {
        $user = User::factory()->create();
        $tech = \App\Models\Tech::factory()->create();

        // Attach tech to user
        $user->techs()->attach($tech->id, ['proficiency' => 'advanced']);

        // Create matching project
        $project = \App\Models\Project::factory()->create(['status' => 'open']);
        $project->techs()->attach($tech->id);

        $response = $this->actingAs($user)->get('/onboarding/recommendations');
        $response->assertJsonCount(1, 'projects');
    }
}
