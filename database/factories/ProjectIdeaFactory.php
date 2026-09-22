<?php

namespace Database\Factories;

use App\Enums\ProjectIdeaCategory;
use App\Enums\ProjectIdeaDifficulty;
use App\Models\ProjectIdea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectIdea>
 */
class ProjectIdeaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = ucfirst(fake()->unique()->words(3, true));

        return [
            'slug' => fake()->unique()->slug(4),
            'title' => $title,
            'summary' => fake()->sentence(10),
            'category' => fake()->randomElement(ProjectIdeaCategory::cases()),
            'difficulty' => fake()->optional()->randomElement(ProjectIdeaDifficulty::cases()),
            'prefill_title' => $title,
            'prefill_description' => fake()->paragraph(),
            'prefill_vision' => fake()->optional()->sentence(),
            'illustration_path' => null,
            'is_published' => true,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
