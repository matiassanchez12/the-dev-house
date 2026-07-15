<?php

declare(strict_types=1);

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_receives_optional_email_notifications_prefers_notification_settings(): void
    {
        $user = User::factory()->create();
        $user->notificationSetting()->create(['collaboration_emails' => false]);
        $user->privacySetting()->create(['email_notifications_enabled' => true]);

        self::assertFalse($user->receivesOptionalEmailNotifications());
    }

    public function test_receives_optional_email_notifications_falls_back_to_legacy_privacy_settings(): void
    {
        $user = User::factory()->create();
        $user->privacySetting()->create(['email_notifications_enabled' => false]);

        self::assertFalse($user->receivesOptionalEmailNotifications());
    }

    public function test_receives_optional_email_notifications_defaults_to_true_without_settings(): void
    {
        $user = User::factory()->create();

        self::assertTrue($user->receivesOptionalEmailNotifications());
    }
}
