<?php

declare(strict_types=1);

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\UserNotificationSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class UserNotificationSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_defaults_enable_collaboration_emails(): void
    {
        self::assertSame(['collaboration_emails' => true], UserNotificationSetting::DEFAULTS);
    }

    public function test_factory_creates_setting_for_user_with_defaults(): void
    {
        $setting = UserNotificationSetting::factory()->create();

        self::assertInstanceOf(User::class, $setting->user);
        self::assertTrue($setting->collaboration_emails);
    }
}
