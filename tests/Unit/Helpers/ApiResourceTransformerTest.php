<?php

namespace Tests\Unit\Helpers;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use App\Models\ProjectIdea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiResourceTransformerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function project_images_are_transformed_to_path_and_disk_url_objects(): void
    {
        config(['filesystems.media_disk' => 'public']);

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

    /** @test */
    public function project_ideas_emit_a_resolved_illustration_url_when_the_path_is_set(): void
    {
        config(['filesystems.media_disk' => 'public']);

        $idea = ProjectIdea::factory()->create([
            'illustration_path' => 'project-ideas/cli-scaffold-proyectos.webp',
        ]);

        $payload = ApiResourceTransformer::projectIdeas(collect([$idea->load('techs')]));

        $this->assertSame(
            Storage::disk('public')->url('project-ideas/cli-scaffold-proyectos.webp'),
            $payload[0]['illustrationUrl'],
        );
    }

    /** @test */
    public function project_ideas_emit_a_null_illustration_url_when_the_path_is_null(): void
    {
        config(['filesystems.media_disk' => 'public']);

        $idea = ProjectIdea::factory()->create(['illustration_path' => null]);

        $payload = ApiResourceTransformer::projectIdeas(collect([$idea->load('techs')]));

        $this->assertNull($payload[0]['illustrationUrl']);
    }
}
