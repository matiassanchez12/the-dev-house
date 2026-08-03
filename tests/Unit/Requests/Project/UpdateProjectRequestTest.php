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
        $files = [];

        if (($data['images'] ?? null) instanceof UploadedFile || is_array($data['images'] ?? null)) {
            $files['images'] = $data['images'];
            unset($data['images']);
        }

        $request = UpdateProjectRequest::create(
            "/projects/{$this->project->id}",
            'PATCH',
            $data,
            [],
            $files,
        );

        $project = $this->project;

        $request->setRouteResolver(static fn (): object => new class($project)
        {
            public function __construct(private Project $project)
            {
            }

            public function parameter(string $name, mixed $default = null): mixed
            {
                return $name === 'project' ? $this->project : $default;
            }
        });

        $validator = Validator::make($request->all(), $request->rules(), $request->messages());
        $request->withValidator($validator);

        return $validator;
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
        $this->assertArrayHasKey('remove_images.0', $validator->errors()->toArray());
    }

    /** @test */
    public function new_images_and_retained_existing_images_cannot_exceed_five_in_total(): void
    {
        $this->project->forceFill([
            'images' => ['projects/one.jpg', 'projects/two.jpg', 'projects/three.jpg', 'projects/four.jpg'],
        ])->save();

        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'images' => [
                UploadedFile::fake()->create('five.jpg', 100, 'image/jpeg'),
                UploadedFile::fake()->create('six.jpg', 100, 'image/jpeg'),
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('images', $validator->errors()->toArray());
    }

    /** @test */
    public function removing_existing_images_frees_capacity_for_new_images(): void
    {
        $this->project->forceFill([
            'images' => ['projects/one.jpg', 'projects/two.jpg', 'projects/three.jpg', 'projects/four.jpg'],
        ])->save();

        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
            'remove_images' => ['projects/one.jpg'],
            'images' => [
                UploadedFile::fake()->create('five.jpg', 100, 'image/jpeg'),
                UploadedFile::fake()->create('six.jpg', 100, 'image/jpeg'),
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function legacy_projects_over_the_image_cap_can_be_updated_without_new_uploads(): void
    {
        $this->project->forceFill([
            'images' => [
                'projects/one.jpg',
                'projects/two.jpg',
                'projects/three.jpg',
                'projects/four.jpg',
                'projects/five.jpg',
                'projects/six.jpg',
            ],
        ])->save();

        $data = [
            'title' => 'My Project',
            'description' => 'A valid description',
            'techs' => $this->validTechIds,
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
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
