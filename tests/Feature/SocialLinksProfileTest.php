<?php

namespace Tests\Feature;

use App\Models\SocialLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialLinksProfileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * TEST: GET /profile includes socialLinks in Inertia props
     */
    public function test_profile_edit_includes_social_links(): void
    {
        $user = User::factory()->create();

        SocialLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('profile/edit')
                ->has('socialLinks', 1)
                ->where('socialLinks.0.platform', 'github')
                ->where('socialLinks.0.url', 'https://github.com/testuser')
        );
    }

    /**
     * TEST: GET /profile includes empty socialLinks when user has none
     */
    public function test_profile_edit_includes_empty_social_links(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('profile/edit')
                ->has('socialLinks', 0)
        );
    }

    /**
     * TEST: PUT /profile/social-links creates new links
     */
    public function test_can_create_social_links(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile/social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'https://github.com/testuser'],
                ['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/testuser'],
            ],
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/profile');

        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);

        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'linkedin',
            'url' => 'https://linkedin.com/in/testuser',
        ]);
    }

    /**
     * TEST: PUT /profile/social-links validates platform
     */
    public function test_social_link_platform_must_be_valid(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile/social-links', [
            'links' => [
                ['platform' => 'invalid_platform', 'url' => 'https://example.com'],
            ],
        ]);

        $response->assertSessionHasErrors('links.0.platform');
    }

    /**
     * TEST: PUT /profile/social-links validates URL format
     */
    public function test_social_link_url_must_be_valid_url(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile/social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'not-a-url'],
            ],
        ]);

        $response->assertSessionHasErrors('links.0.url');
    }

    /**
     * TEST: PUT /profile/social-links updates existing link URL
     */
    public function test_can_update_existing_social_link(): void
    {
        $user = User::factory()->create();

        $link = SocialLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/old-url',
        ]);

        $response = $this->actingAs($user)->put('/profile/social-links', [
            'links' => [
                ['id' => $link->id, 'platform' => 'github', 'url' => 'https://github.com/new-url'],
            ],
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/profile');

        $this->assertDatabaseHas('social_links', [
            'id' => $link->id,
            'url' => 'https://github.com/new-url',
        ]);
    }

    /**
     * TEST: PUT /profile/social-links replaces all links (removes omitted ones)
     */
    public function test_put_replaces_all_links(): void
    {
        $user = User::factory()->create();

        SocialLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);

        SocialLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'twitter',
            'url' => 'https://twitter.com/testuser',
        ]);

        $response = $this->actingAs($user)->put('/profile/social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'https://github.com/testuser'],
            ],
        ]);

        $response->assertSessionHasNoErrors();

        // Twitter link should be removed
        $this->assertDatabaseMissing('social_links', [
            'user_id' => $user->id,
            'platform' => 'twitter',
        ]);

        // GitHub link should remain
        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);
    }

    /**
     * TEST: DELETE /profile/social-links/{id} removes a single link
     */
    public function test_can_delete_single_social_link(): void
    {
        $user = User::factory()->create();

        $link = SocialLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);

        $response = $this->actingAs($user)->delete("/profile/social-links/{$link->id}");

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/profile');

        $this->assertDatabaseMissing('social_links', [
            'id' => $link->id,
        ]);
    }

    /**
     * TEST: Cannot delete another user's social link
     */
    public function test_cannot_delete_another_users_social_link(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $link = SocialLink::factory()->create([
            'user_id' => $otherUser->id,
            'platform' => 'github',
            'url' => 'https://github.com/otheruser',
        ]);

        $response = $this->actingAs($user)->delete("/profile/social-links/{$link->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('social_links', [
            'id' => $link->id,
        ]);
    }

    /**
     * TEST: GET /users/{slug} includes socialLinks in user profile data
     */
    public function test_public_profile_includes_social_links(): void
    {
        $user = User::factory()->create();

        SocialLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/testuser',
        ]);

        $response = $this->get("/users/{$user->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('users/show')
                ->has('user.socialLinks', 1)
                ->where('user.socialLinks.0.platform', 'github')
        );
    }

    /**
     * TEST: Public profile renders correctly when user has no social links
     */
    public function test_public_profile_with_no_social_links(): void
    {
        $user = User::factory()->create();

        $response = $this->get("/users/{$user->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('users/show')
                ->has('user.socialLinks', 0)
        );
    }

    /**
     * TEST: Unauthenticated user cannot access PUT /profile/social-links
     */
    public function test_unauthenticated_cannot_update_social_links(): void
    {
        $response = $this->put('/profile/social-links', [
            'links' => [
                ['platform' => 'github', 'url' => 'https://github.com/testuser'],
            ],
        ]);

        $response->assertRedirect('/login');
    }

    /**
     * TEST: Unauthenticated user cannot access DELETE /profile/social-links/{id}
     */
    public function test_unauthenticated_cannot_delete_social_links(): void
    {
        $response = $this->delete('/profile/social-links/1');

        $response->assertRedirect('/login');
    }

    /**
     * TEST: New platforms (youtube, discord, stackoverflow) are accepted
     */
    public function test_accepts_new_platforms(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile/social-links', [
            'links' => [
                ['platform' => 'youtube', 'url' => 'https://youtube.com/@testuser'],
                ['platform' => 'discord', 'url' => 'https://discord.gg/testserver'],
                ['platform' => 'stackoverflow', 'url' => 'https://stackoverflow.com/users/12345'],
            ],
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'youtube',
        ]);

        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'discord',
        ]);

        $this->assertDatabaseHas('social_links', [
            'user_id' => $user->id,
            'platform' => 'stackoverflow',
        ]);
    }
}
