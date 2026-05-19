<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);
        
        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => str($title)->slug(),
            'description' => fake()->paragraph(),
            'vision' => fake()->optional()->paragraph(),
            'images' => [],
            'status' => fake()->randomElement(['open', 'closed', 'completed']),
            'repository_url' => fake()->optional()->url(),
            'demo_url' => fake()->optional()->url(),
        ];
    }
}
