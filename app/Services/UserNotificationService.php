<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserNotificationSetting;
use Illuminate\Support\Facades\DB;

/**
 * Manages optional collaboration email preferences.
 */
class UserNotificationService
{
    public function getFor(User $user): UserNotificationSetting
    {
        return UserNotificationSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'collaboration_emails' => $user->receivesOptionalEmailNotifications(),
            ],
        );
    }

    /**
     * @param array{collaboration_emails?: bool} $data
     */
    public function update(User $user, array $data): UserNotificationSetting
    {
        return DB::transaction(function () use ($user, $data) {
            $settings = $this->getFor($user);

            if (array_key_exists('collaboration_emails', $data)) {
                $settings->fill($data)->save();
            }

            return $settings;
        });
    }
}
