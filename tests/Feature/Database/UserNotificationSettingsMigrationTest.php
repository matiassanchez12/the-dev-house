<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

final class UserNotificationSettingsMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_false_value_is_migrated_to_collaboration_emails_false(): void
    {
        $user = User::factory()->create();
        $user->privacySetting()->create(['email_notifications_enabled' => false]);

        $this->runMigration();

        $this->assertDatabaseHas('user_notification_settings', [
            'user_id' => $user->id,
            'collaboration_emails' => false,
        ]);
    }

    public function test_missing_legacy_privacy_row_defaults_to_enabled(): void
    {
        $user = User::factory()->create();

        $this->runMigration();

        $this->assertDatabaseHas('user_notification_settings', [
            'user_id' => $user->id,
            'collaboration_emails' => true,
        ]);
    }

    private function runMigration(): void
    {
        Schema::dropIfExists('user_notification_settings');

        $migrationPath = glob(database_path('migrations/*_create_user_notification_settings_table.php'))[0] ?? null;
        self::assertNotNull($migrationPath);

        $migration = require $migrationPath;
        $migration->up();
    }
}
