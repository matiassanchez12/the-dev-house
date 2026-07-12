<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserPrivacySetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserPrivacySetting>
 */
class UserPrivacySettingFactory extends Factory
{
    protected $model = UserPrivacySetting::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            ...UserPrivacySetting::DEFAULTS,
        ];
    }

    public function emailPublic(): static
    {
        return $this->state(fn () => ['show_email' => true]);
    }

    public function phonePublic(): static
    {
        return $this->state(fn () => ['show_phone' => true]);
    }

    public function hidden(): static
    {
        return $this->state(fn () => [
            'is_discoverable' => false,
            'show_activity' => false,
        ]);
    }
}
