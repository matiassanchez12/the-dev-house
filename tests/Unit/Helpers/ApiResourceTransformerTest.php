<?php

namespace Tests\Unit\Helpers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiResourceTransformerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function project_images_are_passed_as_raw_paths(): void
    {
        $project = Project::factory()->create([
            'images' => ['projects/example.jpg'],
        ]);

        $data = ApiResourceTransformer::project($project);

        $this->assertSame(['projects/example.jpg'], $data['images']);
    }
}
