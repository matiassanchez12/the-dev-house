<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\UserPrivacySetting;
use App\Services\UserPrivacyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPrivacyServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserPrivacyService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new UserPrivacyService();
    }

    // === getFor tests ===

    public function test_get_for_creates_default_settings_on_first_call(): void
    {
        $user = User::factory()->create();

        $settings = $this->service->getFor($user);

        $this->assertInstanceOf(UserPrivacySetting::class, $settings);
        $this->assertSame($user->id, $settings->user_id);
        // Defaults must be privacy-first
        $this->assertFalse($settings->show_email);
        $this->assertFalse($settings->show_phone);
        $this->assertTrue($settings->is_discoverable);
        $this->assertTrue($settings->show_activity);
        $this->assertTrue($settings->email_notifications_enabled);
    }

    public function test_get_for_returns_existing_settings_on_subsequent_calls(): void
    {
        $user = User::factory()->create();
        $first = $this->service->getFor($user);

        // Mutate the existing record
        $first->update(['show_email' => true]);

        $second = $this->service->getFor($user);

        $this->assertSame($first->id, $second->id);
        $this->assertTrue($second->show_email);
    }

    public function test_get_for_does_not_duplicate_settings(): void
    {
        $user = User::factory()->create();
        $this->service->getFor($user);
        $this->service->getFor($user);
        $this->service->getFor($user);

        $this->assertCount(1, UserPrivacySetting::where('user_id', $user->id)->get());
    }

    // === update tests ===

    public function test_update_persists_phone_on_user(): void
    {
        $user = User::factory()->create();
        $this->service->getFor($user);

        $this->service->update($user, ['phone' => '+541112345678']);

        $this->assertSame('+541112345678', $user->fresh()->phone);
    }

    public function test_update_persists_privacy_flags(): void
    {
        $user = User::factory()->create();

        $this->service->update($user, [
            'show_email' => true,
            'show_phone' => true,
            'is_discoverable' => false,
            'show_activity' => false,
            'email_notifications_enabled' => false,
        ]);

        $settings = $user->privacySetting()->first();
        $this->assertTrue($settings->show_email);
        $this->assertTrue($settings->show_phone);
        $this->assertFalse($settings->is_discoverable);
        $this->assertFalse($settings->show_activity);
        $this->assertFalse($settings->email_notifications_enabled);
    }

    public function test_update_creates_settings_if_missing(): void
    {
        $user = User::factory()->create();
        $this->assertNull($user->privacySetting()->first());

        $this->service->update($user, ['show_email' => true]);

        $this->assertNotNull($user->privacySetting()->first());
        $this->assertTrue($user->privacySetting()->first()->show_email);
    }

    public function test_update_accepts_partial_privacy_data(): void
    {
        $user = User::factory()->create();
        $this->service->getFor($user);

        // Only update one flag; others should remain at default
        $this->service->update($user, ['show_email' => true]);

        $settings = $user->privacySetting()->first();
        $this->assertTrue($settings->show_email);
        $this->assertFalse($settings->show_phone);
        $this->assertTrue($settings->is_discoverable);
        $this->assertTrue($settings->show_activity);
    }

    public function test_update_supports_nulling_phone(): void
    {
        $user = User::factory()->create();
        $this->service->update($user, ['phone' => '+541112345678']);
        $this->assertSame('+541112345678', $user->fresh()->phone);

        $this->service->update($user, ['phone' => null]);

        $this->assertNull($user->fresh()->phone);
    }
}
