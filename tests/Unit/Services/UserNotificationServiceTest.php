<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\UserNotificationSetting;
use App\Services\UserNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class UserNotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserNotificationService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new UserNotificationService();
    }

    public function test_get_for_creates_default_notification_settings_on_first_call(): void
    {
        $user = User::factory()->create();

        $settings = $this->service->getFor($user);

        self::assertInstanceOf(UserNotificationSetting::class, $settings);
        self::assertSame($user->id, $settings->user_id);
        self::assertTrue($settings->collaboration_emails);
    }

    public function test_get_for_does_not_duplicate_notification_settings(): void
    {
        $user = User::factory()->create();

        $this->service->getFor($user);
        $this->service->getFor($user);

        self::assertCount(1, UserNotificationSetting::where('user_id', $user->id)->get());
    }

    public function test_update_persists_collaboration_emails_flag(): void
    {
        $user = User::factory()->create();

        $settings = $this->service->update($user, ['collaboration_emails' => false]);

        self::assertFalse($settings->collaboration_emails);
        self::assertFalse($user->fresh()->notificationSetting()->first()->collaboration_emails);
    }

    public function test_update_creates_settings_if_missing(): void
    {
        $user = User::factory()->create();

        self::assertNull($user->notificationSetting()->first());

        $this->service->update($user, ['collaboration_emails' => false]);

        self::assertNotNull($user->fresh()->notificationSetting()->first());
        self::assertFalse($user->fresh()->notificationSetting()->first()->collaboration_emails);
    }
}
