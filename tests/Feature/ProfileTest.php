<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    /**
     * TEST: User can update bio
     */
    public function test_user_can_update_bio(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/profile/complete', [
                'bio' => 'Desarrollador con experiencia en React y Laravel',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();
        $this->assertSame('Desarrollador con experiencia en React y Laravel', $user->bio);
    }

    /**
     * TEST: User can upload avatar
     */
    public function test_user_can_upload_avatar(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/profile/complete', [
                'avatar' => \Illuminate\Http\UploadedFile::fake()->image('avatar.jpg', 400, 400),
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertStringStartsWith('avatars/', $user->avatar);
    }

    /**
     * TEST: User can update techs
     */
    public function test_user_can_update_techs(): void
    {
        $user = User::factory()->create();
        
        // Create some techs
        $tech1 = \App\Models\Tech::factory()->create();
        $tech2 = \App\Models\Tech::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/profile/complete', [
                'techs' => [
                    [
                        'id' => $tech1->id,
                        'years_experience' => 3,
                        'proficiency' => 4, // advanced
                    ],
                    [
                        'id' => $tech2->id,
                        'years_experience' => 1,
                        'proficiency' => 2, // intermediate
                    ],
                ],
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        // Verify techs were synced
        $this->assertDatabaseHas('user_tech', [
            'user_id' => $user->id,
            'tech_id' => $tech1->id,
            'years_experience' => 3,
        ]);
        
        $this->assertDatabaseHas('user_tech', [
            'user_id' => $user->id,
            'tech_id' => $tech2->id,
            'years_experience' => 1,
        ]);
    }

    /**
     * TEST: User can update complete profile (bio + avatar + techs)
     */
    public function test_user_can_update_complete_profile(): void
    {
        $user = User::factory()->create();
        $tech = \App\Models\Tech::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/profile/complete', [
                'bio' => 'Full-stack developer',
                'avatar' => \Illuminate\Http\UploadedFile::fake()->image('avatar.jpg', 400, 400),
                'techs' => [
                    [
                        'id' => $tech->id,
                        'years_experience' => 5,
                        'proficiency' => 5, // master
                    ],
                ],
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();
        $this->assertSame('Full-stack developer', $user->bio);
        $this->assertNotNull($user->avatar);
        
        $this->assertDatabaseHas('user_tech', [
            'user_id' => $user->id,
            'tech_id' => $tech->id,
            'years_experience' => 5,
        ]);
    }

    /**
     * TEST: Bio has max 1000 characters
     */
    public function test_bio_has_max_1000_characters(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/profile/complete', [
                'bio' => str_repeat('a', 1001),
            ]);

        $response->assertSessionHasErrors('bio');
    }
}
