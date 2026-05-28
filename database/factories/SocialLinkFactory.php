<?php

namespace Database\Factories;

use App\Models\SocialLink;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SocialLink>
 */
class SocialLinkFactory extends Factory
{
    protected $model = SocialLink::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $platforms = ['github', 'linkedin', 'twitter', 'website', 'youtube', 'discord', 'stackoverflow'];

        return [
            'user_id' => User::factory(),
            'platform' => fake()->randomElement($platforms),
            'url' => fake()->url(),
        ];
    }
}
