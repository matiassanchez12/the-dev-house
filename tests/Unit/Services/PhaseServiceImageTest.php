<?php

namespace Tests\Unit\Services;

use App\Models\Project;
use App\Models\User;
use App\Services\PhaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhaseServiceImageTest extends TestCase
{
    use RefreshDatabase;

    private PhaseService $service;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        config(['filesystems.media_disk' => 'public']);

        $this->service = new PhaseService;
        $this->project = Project::factory()->create(['user_id' => User::factory()->create()->id]);
    }

    public function test_create_stores_image_file(): void
    {
        Storage::fake('public');
        $image = UploadedFile::fake()->create('milestone.jpg', 500, 'image/jpeg');

        $phase = $this->service->create($this->project, [
            'title' => 'First milestone',
            'description' => 'Shipped the MVP',
        ], $image);

        $this->assertNotNull($phase->image_path);
        Storage::disk('public')->assertExists($phase->image_path);
        $this->assertStringContainsString('phases/', $phase->image_path);
    }

    public function test_create_without_image_stores_null(): void
    {
        $phase = $this->service->create($this->project, [
            'title' => 'First milestone',
        ]);

        $this->assertNull($phase->image_path);
    }

    public function test_update_replaces_image_deleting_old(): void
    {
        Storage::fake('public');
        $oldImage = UploadedFile::fake()->create('old.jpg', 500, 'image/jpeg');
        $newImage = UploadedFile::fake()->create('new.jpg', 500, 'image/jpeg');

        $phase = $this->service->create($this->project, ['title' => 'Milestone'], $oldImage);
        $oldPath = $phase->image_path;

        $updated = $this->service->update($phase, ['title' => 'Milestone'], $newImage);

        $this->assertNotEquals($oldPath, $updated->image_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($updated->image_path);
    }

    public function test_update_without_new_image_keeps_existing(): void
    {
        Storage::fake('public');
        $image = UploadedFile::fake()->create('old.jpg', 500, 'image/jpeg');

        $phase = $this->service->create($this->project, ['title' => 'Milestone'], $image);
        $originalPath = $phase->image_path;

        $updated = $this->service->update($phase, ['title' => 'Updated title']);

        $this->assertEquals($originalPath, $updated->image_path);
        Storage::disk('public')->assertExists($updated->image_path);
    }

    public function test_delete_removes_image_from_storage(): void
    {
        Storage::fake('public');
        $image = UploadedFile::fake()->create('milestone.jpg', 500, 'image/jpeg');

        $phase = $this->service->create($this->project, ['title' => 'Milestone'], $image);
        $imagePath = $phase->image_path;

        $this->service->delete($phase);

        $this->assertDatabaseMissing('phases', ['id' => $phase->id]);
        Storage::disk('public')->assertMissing($imagePath);
    }

    public function test_delete_phase_without_image_succeeds(): void
    {
        $phase = $this->service->create($this->project, ['title' => 'Milestone']);

        $this->service->delete($phase);

        $this->assertDatabaseMissing('phases', ['id' => $phase->id]);
    }
}
