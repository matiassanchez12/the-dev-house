<?php

namespace Tests\Feature\Privacy;

use App\Helpers\ApiResourceTransformer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Extends the existing PiiExposureTest coverage with privacy-flag-driven scenarios.
 * Original assertions live in tests/Feature/PiiExposureTest.php; here we focus on
 * the opt-in / opt-out behavior introduced by issue #142.
 */
class PiiExposureExtensionTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_of_other_user_is_hidden_by_default_in_public_profile(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $visitor = User::factory()->create();

        $response = $this->actingAs($visitor)->get("/users/{$owner->slug}");

        $response->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->missing('user.email')
        );
    }

    public function test_email_of_other_user_is_visible_when_show_email_is_true(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $owner->privacySetting()->create(['show_email' => true]);
        $visitor = User::factory()->create();

        $response = $this->actingAs($visitor)->get("/users/{$owner->slug}");

        $response->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->where('user.email', 'owner@example.com')
        );
    }

    public function test_phone_of_other_user_is_visible_only_on_public_profile_when_show_phone_is_true(): void
    {
        $owner = User::factory()->create(['phone' => '+541112345678']);
        $owner->privacySetting()->create(['show_phone' => true]);

        $response = $this->get("/users/{$owner->slug}");

        $response->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->where('user.phone', '+541112345678')
        );
    }

    public function test_phone_of_other_user_is_never_in_default_transformer_output(): void
    {
        $owner = User::factory()->create(['phone' => '+541112345678']);
        $owner->privacySetting()->create(['show_phone' => true]);

        $transformed = ApiResourceTransformer::user($owner->fresh());

        $this->assertArrayNotHasKey('phone', $transformed);
    }

    public function test_public_profile_hides_activity_when_show_activity_is_false(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = \App\Models\Project::factory()->create(['user_id' => $owner->id]);
        $project->participants()->attach($otherUser->id, ['role' => 'dev', 'joined_at' => now()]);
        $owner->privacySetting()->create(['show_activity' => false]);

        $response = $this->get("/users/{$owner->slug}");

        $response->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->where('user.createdProjects', [])
            ->where('user.participatingProjects', [])
        );
    }

    public function test_users_with_is_discoverable_false_are_excluded_from_directory(): void
    {
        $public = User::factory()->create(['name' => 'Public User']);
        $private = User::factory()->create(['name' => 'Private User']);
        $private->privacySetting()->create(['is_discoverable' => false]);

        $response = $this->get(route('users.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('users/index')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Public User')
            ->where('users.meta.total', 1)
        );
    }

    public function test_user_can_see_their_own_email_in_profile_edit_even_when_show_email_false(): void
    {
        $user = User::factory()->create(['email' => 'me@example.com']);
        $user->privacySetting()->create(['show_email' => false]);

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertInertia(fn ($page) => $page
            ->component('profile/edit')
            ->where('email', 'me@example.com')
        );
    }

    public function test_user_can_see_their_own_phone_in_privacy_response(): void
    {
        $user = User::factory()->create();
        $user->update(['phone' => '+541112345678']);

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'phone' => '+541199999999',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame('+541199999999', $user->fresh()->phone);
    }

    public function test_project_context_does_not_expose_creator_email_even_when_user_opted_in(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $owner->privacySetting()->create(['show_email' => true]);
        $project = \App\Models\Project::factory()->create(['user_id' => $owner->id]);

        $response = $this->get(route('projects.show', $project));

        $response->assertInertia(fn ($page) => $page
            ->missing('project.creator.email')
        );
    }

    public function test_transformer_does_not_leak_email_in_user_payload_when_show_email_false(): void
    {
        $user = User::factory()->create(['email' => 'hidden@example.com']);
        $user->privacySetting()->create(['show_email' => false]);

        $transformed = ApiResourceTransformer::user($user->fresh());

        $this->assertArrayNotHasKey('email', $transformed);
    }
}
