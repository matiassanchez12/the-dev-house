<?php

namespace Tests\Unit\Helpers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiResourceTransformerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function project_images_are_transformed_to_path_and_disk_url_objects(): void
    {
        $project = Project::factory()->create([
            'images' => ['projects/example.jpg'],
        ]);

        $data = ApiResourceTransformer::project($project);

        $this->assertSame([
            [
                'path' => 'projects/example.jpg',
                'url' => Storage::disk('public')->url('projects/example.jpg'),
            ],
        ], $data['images']);
    }
}
