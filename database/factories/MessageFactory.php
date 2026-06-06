<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'body' => fake()->sentence(),
            'type' => 'text',
            'file_url' => null,
            'read_at' => null,
        ];
    }
}
