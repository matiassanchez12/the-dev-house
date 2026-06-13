<?php

namespace Database\Factories;

use App\Models\Phase;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Phase>
 */
class PhaseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'completed_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
