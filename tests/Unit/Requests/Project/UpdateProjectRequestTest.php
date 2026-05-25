<?php

namespace Tests\Unit\Requests\Project;

use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdateProjectRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;
    private array $validTechIds;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $techs = Tech::factory()->count(3)->create();
        $this->validTechIds = $techs->pluck('id')->toArray();

        $this->project = Project::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Original Title',
            'slug' => 'original-title',
            'description' => 'Original description',
        ]);
    }

    /**
     * Helper to make a Validator instance from the request with given data.
     */
    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new UpdateProjectRequest();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function title_is_required(): void
    {
        $data = [
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    /** @test */
    public function title_must_be_unique_except_for_current_project(): void
    {
        // Create another project with the same title
        $anotherProject = Project::factory()->create([
            'title' => 'Duplicate Title',
            'slug' => 'duplicate-title',
        ]);

        $data = [
            'title' => 'Duplicate Title',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    /** @test */
    public function title_can_be_same_as_current_project(): void
    {
        $data = [
            'title' => 'Original Title',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function description_is_required(): void
    {
        $data = [
            'title' => 'My Project',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('description', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_must_be_an_array(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => 'not-an-array',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_must_have_at_least_one_element(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => [],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs', $validator->errors()->toArray());
    }

    /** @test */
    public function remove_images_must_be_an_array(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'remove_images' => 'not-an-array',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('remove_images', $validator->errors()->toArray());
    }

    /** @test */
    public function remove_images_items_must_be_strings(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'remove_images' => [123, 456],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('remove_images.*', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_data_passes_validation(): void
    {
        $data = [
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'vision' => 'Updated vision',
            'techs' => $this->validTechIds,
            'repository_url' => 'https://github.com/test/project',
            'demo_url' => 'https://my-project.com',
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_data_with_remove_images_passes_validation(): void
    {
        $data = [
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'techs' => $this->validTechIds,
            'remove_images' => ['projects/image1.jpg', 'projects/image2.jpg'],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}