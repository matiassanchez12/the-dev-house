<?php

namespace Tests\Feature;

use App\Enums\ProjectIdeaCategory;
use App\Models\Project;
use App\Models\ProjectIdea;
use App\Models\SocialLink;
use App\Models\Tech;
use App\Models\User;
use App\Services\ProjectIdeaService;
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
        $tech = Tech::factory()->create([
            'category' => 'frontend',
            'slug' => 'react',
        ]);

        $response = $this->actingAs($user)->get('/onboarding');

        $response->assertStatus(200);

        $allTechs = collect($response->viewData('page')['props']['allTechs']);

        $this->assertTrue($allTechs->contains(fn (array $item): bool => $item['id'] === $tech->id && $item['category'] === 'frontend'));
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
        $tech = Tech::factory()->create();

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
        $tech = Tech::factory()->create();

        $project = Project::factory()->create([
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
        $tech = Tech::factory()->create();

        // Attach tech to user
        $user->techs()->attach($tech->id, ['proficiency' => 'advanced']);

        // Create matching project
        $project = Project::factory()->create(['status' => 'open']);
        $project->techs()->attach($tech->id);

        $response = $this->actingAs($user)->get('/onboarding/recommendations');
        $response->assertJsonCount(1, 'projects');
    }

    /**
     * TEST 9: User can complete step social links — saves links and redirects
     */
    public function test_user_can_complete_step_social_links(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'https://github.com/testuser'],
                ['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/testuser'],
            ],
        ]);

        $response->assertRedirect('/onboarding');
        $this->assertDatabaseCount('social_links', 2);
        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);
    }

    /**
     * TEST 10: Social links invalid URL rejected
     */
    public function test_social_links_invalid_url_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'not-a-url'],
            ],
        ]);

        $response->assertSessionHasErrors('links.0.url');
        $this->assertDatabaseCount('social_links', 0);
    }

    /**
     * TEST 11: Social links invalid platform rejected
     */
    public function test_social_links_invalid_platform_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'facebook', 'url' => 'https://facebook.com/user'],
            ],
        ]);

        $response->assertSessionHasErrors('links.0.platform');
    }

    /**
     * TEST 12: Social links empty array is accepted (step is optional).
     */
    public function test_social_links_empty_array_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [],
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/onboarding');
    }

    /**
     * TEST 12a: Social links field absent is accepted without 500.
     */
    public function test_social_links_field_absent_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', []);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/onboarding');
    }

    /**
     * TEST 12b: Social links null is accepted without 500.
     */
    public function test_social_links_null_value_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => null,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/onboarding');
    }

    /**
     * TEST 12c: Social links rejected when an item has platform but no url.
     */
    public function test_social_links_partial_item_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'github', 'url' => ''],
            ],
        ]);

        $response->assertSessionHasErrors('links.0.url');
    }

    /**
     * TEST 12c: Tech selection is capped at 3 items.
     */
    public function test_tech_selection_capped_at_three(): void
    {
        $user = User::factory()->create();
        $techs = Tech::factory()->count(4)->create();

        $payload = [
            'techs' => $techs->map(fn ($tech) => [
                'id' => $tech->id,
                'proficiency' => 3,
            ])->all(),
        ];

        $response = $this->actingAs($user)->post('/onboarding/step-1', $payload);

        $response->assertSessionHasErrors('techs');
    }

    /**
     * TEST 13: Social links upsert updates existing record
     */
    public function test_social_links_upsert_updates_existing(): void
    {
        $user = User::factory()->create();
        SocialLink::create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/old',
        ]);

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'https://github.com/new'],
            ],
        ]);

        $response->assertRedirect('/onboarding');
        $this->assertDatabaseCount('social_links', 1);
        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/new',
        ]);
    }

    /**
     * TEST 14: Social links cascade delete on user removal
     */
    public function test_social_links_cascade_delete(): void
    {
        $user = User::factory()->create();
        SocialLink::create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/user',
        ]);

        $userId = $user->id;
        $user->delete();

        $this->assertDatabaseCount('social_links', 0);
    }

    /**
     * TEST 15: Onboarding total steps is five
     */
    public function test_onboarding_total_steps_is_five(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/onboarding');

        $response->assertInertia(fn ($page) => $page->where('totalSteps', 5));
    }

    /**
     * TEST 16: Social links URL max length (2048 chars) rejected
     */
    public function test_social_links_url_max_length_rejected(): void
    {
        $user = User::factory()->create();

        $longUrl = 'https://example.com/'.str_repeat('a', 2048);

        $response = $this->actingAs($user)->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'github', 'url' => $longUrl],
            ],
        ]);

        $response->assertSessionHasErrors('links.0.url');
        $this->assertDatabaseCount('social_links', 0);
    }

    /**
     * TEST 17: Social link user relationship returns correct user
     */
    public function test_social_link_user_relationship(): void
    {
        $user = User::factory()->create();
        $socialLink = SocialLink::create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);

        $this->assertTrue($socialLink->user->is($user));
        $this->assertEquals($user->id, $socialLink->user->id);
    }

    /**
     * TEST 19: Onboarding index exposes featuredIdeas matching the service output.
     */
    public function test_onboarding_index_exposes_featured_ideas(): void
    {
        $user = User::factory()->create();

        ProjectIdea::factory()->create([
            'slug' => 'featured-tools',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'featured-clone',
            'category' => ProjectIdeaCategory::Clones,
            'sort_order' => 1,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'draft-idea',
            'category' => ProjectIdeaCategory::Aprendizaje,
            'sort_order' => 1,
            'is_published' => false,
        ]);

        $response = $this->actingAs($user)->get('/onboarding');

        $response->assertOk();

        $expected = app(ProjectIdeaService::class)->featuredForOnboarding();

        $response->assertInertia(
            fn ($page) => $page
                ->where('totalSteps', 5)
                ->where('featuredIdeas', $expected)
        );

        $this->assertSame(
            ['featured-tools', 'featured-clone'],
            collect($response->viewData('page')['props']['featuredIdeas'])->pluck('slug')->all(),
        );
    }

    /**
     * TEST 20: Step 4 with a valid published idea slug completes onboarding and redirects to create.
     */
    public function test_step_4_with_valid_idea_slug_redirects_to_create_and_completes(): void
    {
        $user = User::factory()->create();
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);

        $idea = ProjectIdea::factory()->create([
            'slug' => 'handoff-idea',
            'is_published' => true,
        ]);

        $response = $this->actingAs($user)->post('/onboarding/step-4', [
            'join_requests' => [$project->id],
            'idea_slug' => $idea->slug,
        ]);

        $response->assertRedirect('/projects/create?idea=handoff-idea');
        $this->assertNotNull($user->fresh()->onboarding_completed_at);
        $this->assertDatabaseHas('join_requests', [
            'user_id' => $user->id,
            'project_id' => $project->id,
        ]);
    }

    /**
     * TEST 21: Step 4 with an unpublished idea slug is rejected and does not complete onboarding.
     */
    public function test_step_4_with_unpublished_idea_slug_is_rejected(): void
    {
        $user = User::factory()->create();

        $idea = ProjectIdea::factory()->create([
            'slug' => 'unpublished-idea',
            'is_published' => false,
        ]);

        $response = $this->actingAs($user)->post('/onboarding/step-4', [
            'idea_slug' => $idea->slug,
        ]);

        $response->assertSessionHasErrors('idea_slug');
        $this->assertNull($user->fresh()->onboarding_completed_at);
    }

    /**
     * TEST 22: Step 4 with an unknown idea slug is rejected.
     */
    public function test_step_4_with_unknown_idea_slug_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-4', [
            'idea_slug' => 'does-not-exist',
        ]);

        $response->assertSessionHasErrors('idea_slug');
        $this->assertNull($user->fresh()->onboarding_completed_at);
    }

    /**
     * TEST 23: Step 4 with no idea slug still redirects to the dashboard and completes onboarding.
     */
    public function test_step_4_without_idea_slug_redirects_to_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-4', [
            'join_requests' => [],
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertNotNull($user->fresh()->onboarding_completed_at);
    }

    /**
     * TEST 24: Step 4 with an empty idea slug redirects to the dashboard (ConvertEmptyStringsToNull).
     */
    public function test_step_4_with_empty_idea_slug_redirects_to_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding/step-4', [
            'idea_slug' => '',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/dashboard');
        $this->assertNotNull($user->fresh()->onboarding_completed_at);
    }

    /**
     * TEST 18: Complete onboarding flow through all five steps
     */
    public function test_complete_onboarding_flow_all_five_steps(): void
    {
        $user = User::factory()->create();
        $tech = Tech::factory()->create();
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $project->techs()->attach($tech->id);

        // Step 1: Techs
        $this->actingAs($user)->post('/onboarding/step-1', [
            'techs' => [['id' => $tech->id, 'proficiency' => '3']],
        ]);

        // Step 2: Bio
        $this->post('/onboarding/step-2', [
            'bio' => 'I am a developer',
        ]);

        // Step 3: Social Links
        $this->post('/onboarding/step-social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'https://github.com/testuser'],
            ],
        ]);

        // Step 4: Avatar (optional, skip by not sending file)
        $this->post('/onboarding/step-3', []);

        // Step 5: Join requests
        $response = $this->post('/onboarding/step-4', [
            'join_requests' => [$project->id],
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertNotNull($user->fresh()->onboarding_completed_at);
    }
}
