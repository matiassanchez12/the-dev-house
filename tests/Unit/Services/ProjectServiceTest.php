<?php

namespace Tests\Unit\Services;

use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProjectService $service;
    private User $user;
    private array $techIds;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ProjectService();
        $this->user = User::factory()->create();

        $techs = Tech::factory()->count(3)->create();
        $this->techIds = $techs->pluck('id')->toArray();
    }

    // === generateUniqueSlug tests ===

    /** @test */
    public function generate_unique_slug_creates_url_safe_slug(): void
    {
        $slug = $this->service->generateUniqueSlug('My Awesome Project');

        $this->assertEquals('my-awesome-project', $slug);
    }

    /** @test */
    public function generate_unique_slug_appends_counter_when_duplicate_exists(): void
    {
        Project::factory()->create(['slug' => 'my-project']);

        $slug = $this->service->generateUniqueSlug('My Project');

        $this->assertEquals('my-project-1', $slug);
    }

    /** @test */
    public function generate_unique_slug_skips_own_id_when_exclude_id_provided(): void
    {
        $project = Project::factory()->create(['title' => 'Existing', 'slug' => 'existing']);

        $slug = $this->service->generateUniqueSlug('Existing', $project->id);

        $this->assertEquals('existing', $slug);
    }

    // === create tests ===

    /** @test */
    public function create_establishes_creator_and_techs(): void
    {
        $data = [
            'title' => 'New Project',
            'description' => 'Project description',
            'vision' => 'Our vision',
            'repository_url' => 'https://github.com/test/project',
            'demo_url' => 'https://demo.com',
            'techs' => $this->techIds,
        ];

        $project = $this->service->create($this->user, $data);

        $this->assertEquals('new-project', $project->slug);
        $this->assertEquals($this->user->id, $project->user_id);
        $this->assertCount(3, $project->techs);
    }

    // === uploadImages tests ===

    /** @test */
    public function upload_images_stores_files_and_returns_paths(): void
    {
        Storage::fake('public');

        $files = [
            UploadedFile::fake()->image('project1.jpg'),
            UploadedFile::fake()->image('project2.jpg'),
        ];

        $paths = $this->service->uploadImages($files);

        $this->assertCount(2, $paths);
        Storage::disk('public')->assertExists($paths[0]);
        Storage::disk('public')->assertExists($paths[1]);
    }

    /** @test */
    public function create_always_stores_project_images_on_the_public_disk(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 's3']);

        $image = UploadedFile::fake()->image('project.jpg');

        $project = $this->service->create($this->user, [
            'title' => 'Project with Images',
            'description' => 'Project description',
            'techs' => $this->techIds,
            'images' => [$image],
        ]);

        $this->assertCount(1, $project->images);
        $this->assertIsString($project->images[0]);
        Storage::disk('public')->assertExists($project->images[0]);
    }

    // === deleteImages tests ===

    /** @test */
    public function delete_images_removes_files_from_storage(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('to-delete.jpg');
        $path = $file->store('projects', 'public');

        Storage::disk('public')->assertExists($path);

        $this->service->deleteImages([$path]);

        Storage::disk('public')->assertMissing($path);
    }

    /** @test */
    public function delete_images_does_not_throw_when_file_missing(): void
    {
        Storage::fake('public');

        // Should not throw
        $this->service->deleteImages(['nonexistent/path.jpg']);

        $this->assertTrue(true); // If we get here, no exception was thrown
    }

    // === update tests ===

    /** @test */
    public function update_refreshes_slug_when_title_changes(): void
    {
        $project = Project::factory()->create([
            'title' => 'Original Title',
            'slug' => 'original-title',
        ]);

        $this->service->update($project, [
            'title' => 'New Title',
            'description' => 'Updated description',
            'techs' => $this->techIds,
        ]);

        $project->refresh();
        $this->assertEquals('new-title', $project->slug);
    }

    /** @test */
    public function update_keeps_slug_when_title_unchanged(): void
    {
        $project = Project::factory()->create([
            'title' => 'Same Title',
            'slug' => 'same-title',
        ]);

        $this->service->update($project, [
            'title' => 'Same Title',
            'description' => 'Updated description',
            'techs' => $this->techIds,
        ]);

        $project->refresh();
        $this->assertEquals('same-title', $project->slug);
    }

    /** @test */
    public function update_syncs_techs(): void
    {
        $project = Project::factory()->create(['user_id' => $this->user->id]);
        $project->techs()->attach($this->techIds);

        $newTechs = Tech::factory()->count(2)->create();
        $newTechIds = $newTechs->pluck('id')->toArray();

        $this->service->update($project, [
            'title' => 'Updated Project',
            'description' => 'Updated description',
            'techs' => $newTechIds,
        ]);

        $project->refresh();
        $this->assertCount(2, $project->techs);
    }

    /** @test */
    public function update_handles_remove_images(): void
    {
        Storage::fake('public');

        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'images' => ['projects/image1.jpg', 'projects/image2.jpg'],
        ]);

        // Create actual files
        $file1 = UploadedFile::fake()->image('image1.jpg')->store('projects', 'public');
        $file2 = UploadedFile::fake()->image('image2.jpg')->store('projects', 'public');
        $project->images = [$file1, $file2];
        $project->save();

        Storage::disk('public')->assertExists($file1);
        Storage::disk('public')->assertExists($file2);

        $this->service->update($project, [
            'title' => 'Updated Project',
            'description' => 'Updated description',
            'techs' => $this->techIds,
            'remove_images' => [$file2],
        ]);

        $project->refresh();
        $this->assertCount(1, $project->images);
        Storage::disk('public')->assertMissing($file2);
    }

    // === delete tests ===

    /** @test */
    public function delete_removes_project(): void
    {
        Storage::fake('public');

        $project = Project::factory()->create(['user_id' => $this->user->id]);
        $projectId = $project->id;

        $this->service->delete($project);

        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
    }

    /** @test */
    public function delete_removes_images_from_storage(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('project.jpg')->store('projects', 'public');
        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'images' => [$file],
        ]);

        Storage::disk('public')->assertExists($file);

        $this->service->delete($project);

        Storage::disk('public')->assertMissing($file);
    }
}
