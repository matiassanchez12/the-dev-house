<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPrivacySetting;
use Illuminate\Support\Facades\DB;

/**
 * Manages per-user privacy preferences and the user's contact phone number.
 *
 * The phone field lives on the users table (encrypted at rest) because it is
 * a personal attribute of the User. Visibility preferences live in a separate
 * `user_privacy_settings` row keyed by user_id.
 */
class UserPrivacyService
{
    /**
     * Privacy keys that map 1:1 to user_privacy_settings columns.
     *
     * @var list<string>
     */
    private const PRIVACY_KEYS = [
        'show_email',
        'show_phone',
        'is_discoverable',
        'show_activity',
    ];

    /**
     * Get the privacy settings for a user, creating the default row if missing.
     */
    public function getFor(User $user): UserPrivacySetting
    {
        return UserPrivacySetting::firstOrCreate(
            ['user_id' => $user->id],
            UserPrivacySetting::DEFAULTS,
        );
    }

    /**
     * Update the user's phone and any provided privacy flags atomically.
     *
     * The phone belongs on the User model; privacy flags live in
     * `user_privacy_settings`. Both are written inside a single DB transaction
     * so partial writes never reach the database.
     *
     * @param  array{phone?: string|null, show_email?: bool, show_phone?: bool, is_discoverable?: bool, show_activity?: bool}  $data
     */
    public function update(User $user, array $data): UserPrivacySetting
    {
        return DB::transaction(function () use ($user, $data) {
            if (array_key_exists('phone', $data)) {
                $user->phone = $data['phone'];
                $user->save();
            }

            $privacyData = array_intersect_key($data, array_flip(self::PRIVACY_KEYS));

            $settings = $this->getFor($user);

            if (! empty($privacyData)) {
                $settings->fill($privacyData)->save();
            }

            return $settings;
        });
    }
}
