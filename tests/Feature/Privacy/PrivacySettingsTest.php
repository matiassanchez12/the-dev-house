<?php

namespace Tests\Feature\Privacy;

use App\Models\User;
use App\Models\UserPrivacySetting;
use App\Models\UserNotificationSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivacySettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_update_privacy(): void
    {
        $response = $this->post(route('profile.privacy.update'), [
            'show_email' => true,
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_update_their_own_privacy(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'phone' => '+541112345678',
            'show_email' => true,
            'show_phone' => false,
            'is_discoverable' => true,
            'show_activity' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $user->refresh();
        $this->assertSame('+541112345678', $user->phone);

        $settings = $user->privacySetting()->first();
        $this->assertNotNull($settings);
        $this->assertTrue($settings->show_email);
        $this->assertFalse($settings->show_phone);

        $profileResponse = $this->actingAs($user)->get(route('profile.edit'));

        $profileResponse->assertInertia(fn ($page) => $page
            ->where('privacySetting.show_email', true)
            ->where('notificationSetting.collaboration_emails', true)
        );
    }

    public function test_phone_is_optional(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'show_email' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertNull($user->fresh()->phone);
    }

    public function test_settings_auto_created_on_first_update(): void
    {
        $user = User::factory()->create();
        $this->assertNull($user->privacySetting()->first());

        $this->actingAs($user)->post(route('profile.privacy.update'), [
            'show_email' => true,
        ]);

        $this->assertNotNull($user->fresh()->privacySetting()->first());
    }

    public function test_profile_edit_hydrates_default_notification_setting_true(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertInertia(fn ($page) => $page
            ->where('notificationSetting.collaboration_emails', true)
        );
    }

    public function test_profile_edit_preserves_legacy_notification_opt_out_when_setting_is_missing(): void
    {
        $user = User::factory()->create();
        $user->privacySetting()->create(['email_notifications_enabled' => false]);

        $this->assertNull($user->fresh()->notificationSetting()->first());

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertInertia(fn ($page) => $page
            ->where('notificationSetting.collaboration_emails', false)
        );

        $settings = $user->fresh()->notificationSetting()->first();
        $this->assertNotNull($settings);
        $this->assertFalse($settings->collaboration_emails);
        $this->assertFalse($user->fresh()->receivesOptionalEmailNotifications());
    }

    public function test_authenticated_user_can_update_notification_settings(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.notifications.update'), [
            'collaboration_emails' => false,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $settings = $user->fresh()->notificationSetting()->first();
        $this->assertInstanceOf(UserNotificationSetting::class, $settings);
        $this->assertFalse($settings->collaboration_emails);
    }

    public function test_guest_cannot_update_notification_settings(): void
    {
        $response = $this->post(route('profile.notifications.update'), [
            'collaboration_emails' => false,
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_notification_settings_validation_rejects_non_boolean(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.notifications.update'), [
            'collaboration_emails' => 'not-a-boolean',
        ]);

        $response->assertSessionHasErrors('collaboration_emails');
    }

    public function test_phone_validation_rejects_too_long_value(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'phone' => str_repeat('1', 31),
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_phone_validation_rejects_invalid_format(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'phone' => 'abc@@@',
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_privacy_flags_validation_rejects_non_boolean(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'show_email' => 'not-a-boolean',
        ]);

        $response->assertSessionHasErrors('show_email');
    }

    public function test_legacy_email_notifications_field_is_rejected_on_privacy_update(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.privacy.update'), [
            'email_notifications_enabled' => false,
        ]);

        $response->assertSessionHasErrors('email_notifications_enabled');
        $this->assertNull($user->fresh()->notificationSetting()->first());
    }

    public function test_updating_privacy_only_affects_current_user(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();

        // The route is scoped to auth()->user() by design (no user_id in payload).
        $this->actingAs($alice)->post(route('profile.privacy.update'), [
            'show_email' => true,
        ]);

        $aliceSettings = $alice->fresh()->privacySetting()->first();
        $bobSettings = $bob->fresh()->privacySetting()->first();

        $this->assertNotNull($aliceSettings);
        $this->assertTrue($aliceSettings->show_email);
        $this->assertNull($bobSettings);
    }

    public function test_profile_edit_receives_phone_and_privacy_setting(): void
    {
        $user = User::factory()->create(['phone' => '+541112345678']);
        $user->privacySetting()->create(['show_email' => true]);

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertInertia(fn ($page) => $page
            ->where('phone', '+541112345678')
            ->where('privacySetting.show_email', true)
        );
    }
}
