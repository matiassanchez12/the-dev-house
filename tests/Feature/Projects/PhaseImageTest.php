<?php

namespace Tests\Feature\Projects;

use App\Helpers\ApiResourceTransformer;
use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhaseImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_creator_can_create_phase_with_image(): void
    {
        Storage::fake('public');
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $image = UploadedFile::fake()->create('milestone.jpg', 500, 'image/jpeg');

        $response = $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
            'description' => 'Validated the idea',
            'image' => $image,
        ]);

        $response->assertRedirect(route('projects.show', $project));

        $phase = Phase::query()->where('project_id', $project->id)->firstOrFail();
        $this->assertNotNull($phase->image_path);
        Storage::disk('public')->assertExists($phase->image_path);
    }

    public function test_project_creator_can_create_phase_without_image(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);

        $response = $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
        ]);

        $response->assertRedirect(route('projects.show', $project));

        $phase = Phase::query()->where('project_id', $project->id)->firstOrFail();
        $this->assertNull($phase->image_path);
    }

    public function test_project_creator_can_update_phase_image(): void
    {
        Storage::fake('public');
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $phase = Phase::factory()->create(['project_id' => $project->id]);

        $oldImage = UploadedFile::fake()->create('old.jpg', 500, 'image/jpeg');
        $newImage = UploadedFile::fake()->create('new.jpg', 500, 'image/jpeg');

        // First upload
        $this->actingAs($creator)->put(route('projects.phases.update', [$project, $phase]), [
            'title' => $phase->title,
            'image' => $oldImage,
        ]);

        $phase->refresh();
        $oldPath = $phase->image_path;
        Storage::disk('public')->assertExists($oldPath);

        // Replace with new image
        $this->actingAs($creator)->put(route('projects.phases.update', [$project, $phase]), [
            'title' => $phase->title,
            'image' => $newImage,
        ]);

        $phase->refresh();
        $this->assertNotEquals($oldPath, $phase->image_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($phase->image_path);
    }

    public function test_deleting_phase_removes_image_from_storage(): void
    {
        Storage::fake('public');
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $image = UploadedFile::fake()->create('milestone.jpg', 500, 'image/jpeg');

        $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
            'image' => $image,
        ]);

        $phase = Phase::query()->where('project_id', $project->id)->firstOrFail();
        $imagePath = $phase->image_path;
        Storage::disk('public')->assertExists($imagePath);

        $this->actingAs($creator)->delete(route('projects.phases.destroy', [$project, $phase]));

        $this->assertDatabaseMissing('phases', ['id' => $phase->id]);
        Storage::disk('public')->assertMissing($imagePath);
    }

    public function test_deleting_phase_without_image_succeeds(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $phase = Phase::factory()->create(['project_id' => $project->id, 'image_path' => null]);

        $response = $this->actingAs($creator)->delete(route('projects.phases.destroy', [$project, $phase]));

        $response->assertRedirect(route('projects.show', $project));
        $this->assertDatabaseMissing('phases', ['id' => $phase->id]);
    }

    public function test_validation_rejects_oversized_image(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $image = UploadedFile::fake()->create('big.jpg', 3000, 'image/jpeg'); // 3MB

        $response = $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
            'image' => $image,
        ]);

        $response->assertSessionHasErrors('image');
        $this->assertDatabaseCount('phases', 0);
    }

    public function test_validation_rejects_gif_format(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $image = UploadedFile::fake()->create('animation.gif', 500, 'image/gif');

        $response = $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
            'image' => $image,
        ]);

        $response->assertSessionHasErrors('image');
        $this->assertDatabaseCount('phases', 0);
    }

    public function test_phase_image_appears_in_api_response(): void
    {
        Storage::fake('public');
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $image = UploadedFile::fake()->create('milestone.jpg', 500, 'image/jpeg');

        $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
            'image' => $image,
        ]);

        $phase = Phase::query()->where('project_id', $project->id)->firstOrFail();
        $phase->load('project');

        $transformed = ApiResourceTransformer::phase($phase);

        $this->assertNotNull($transformed['image']);
        $this->assertArrayHasKey('path', $transformed['image']);
        $this->assertArrayHasKey('url', $transformed['image']);
        $this->assertStringContainsString('phases/', $transformed['image']['path']);
    }
}
