<?php

namespace Tests\Unit\Requests\Project;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreProjectRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private array $validTechIds;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $techs = Tech::factory()->count(3)->create();
        $this->validTechIds = $techs->pluck('id')->toArray();
    }

    /**
     * Helper to make a Validator instance from the request with given data.
     */
    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new StoreProjectRequest();
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
    public function title_must_be_unique(): void
    {
        // Create an existing project with this title
        $existingProject = \App\Models\Project::factory()->create([
            'title' => 'Existing Project Title',
            'slug' => 'existing-project-title',
        ]);

        $data = [
            'title' => 'Existing Project Title',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    /** @test */
    public function title_must_not_exceed_255_characters(): void
    {
        $data = [
            'title' => str_repeat('a', 256),
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
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
    public function description_must_not_exceed_1000_characters(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => str_repeat('a', 1001),
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
    public function techs_ids_must_exist_in_techs_table(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => [99999, 88888],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0', $validator->errors()->toArray());
    }

    /** @test */
    public function images_must_be_an_array_when_provided(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'images' => 'not-an-array',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('images', $validator->errors()->toArray());
    }

    /** @test */
    public function images_must_not_exceed_5_files(): void
    {
        $files = [];
        for ($i = 0; $i < 6; $i++) {
            $files[] = UploadedFile::fake()->image("project{$i}.jpg");
        }

        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'images' => $files,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('images', $validator->errors()->toArray());
    }

    /** @test */
    public function images_must_each_be_max_2mb(): void
    {
        $files = [
            UploadedFile::fake()->create('large_image.jpg', 3000), // 3MB
        ];

        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'images' => $files,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('images.0', $validator->errors()->toArray());
    }

    /** @test */
    public function repository_url_must_be_a_valid_url(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'repository_url' => 'not-a-url',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('repository_url', $validator->errors()->toArray());
    }

    /** @test */
    public function demo_url_must_be_a_valid_url(): void
    {
        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'demo_url' => 'not-a-url',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('demo_url', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_data_passes_validation(): void
    {
        $data = [
            'title' => 'My Awesome Project',
            'description' => 'This is an awesome project description',
            'vision' => 'Our vision is to change the world',
            'techs' => $this->validTechIds,
            'repository_url' => 'https://github.com/test/project',
            'demo_url' => 'https://my-project.com',
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}