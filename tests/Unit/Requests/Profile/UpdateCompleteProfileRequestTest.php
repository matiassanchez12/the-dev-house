<?php

namespace Tests\Unit\Requests\Profile;

use App\Http\Requests\Profile\UpdateCompleteProfileRequest;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdateCompleteProfileRequestTest extends TestCase
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
        $request = new UpdateCompleteProfileRequest();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function bio_is_optional(): void
    {
        $data = [];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function bio_must_not_exceed_1000_characters(): void
    {
        $data = [
            'bio' => str_repeat('a', 1001),
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('bio', $validator->errors()->toArray());
    }

    /** @test */
    public function avatar_must_be_an_image_when_provided(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('document.pdf', 100),
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('avatar', $validator->errors()->toArray());
    }

    /** @test */
    public function avatar_must_not_exceed_2mb(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('large_avatar.jpg', 3000), // 3MB
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('avatar', $validator->errors()->toArray());
    }

    /** @test */
    public function avatar_must_be_jpg_png_or_webp(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.gif', 100, 'image/gif'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('avatar', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_must_be_an_array_when_provided(): void
    {
        $data = [
            'techs' => 'not-an-array',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_id_must_exist_in_techs_table(): void
    {
        $data = [
            'techs' => [
                ['id' => 99999, 'proficiency' => 'basic'],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.id', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_proficiency_must_be_valid_enum(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 'invalid'],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.proficiency', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_bio_only_passes_validation(): void
    {
        $data = [
            'bio' => 'This is my developer bio with more than 10 characters.',
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_avatar_jpg_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_avatar_png_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.png', 100, 'image/png'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_avatar_webp_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.webp', 100, 'image/webp'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_techs_with_all_fields_passes(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 'basic'],
                ['id' => $this->validTechIds[1], 'proficiency' => 'intermediate'],
                ['id' => $this->validTechIds[2], 'proficiency' => 'advanced'],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_complete_profile_update_passes(): void
    {
        $data = [
            'bio' => 'My comprehensive bio',
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 'expert'],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /**
     * Regression test for #30: years_experience must be an integer.
     * Previously the column was decimal(3,1) and the form submitted
     * decimals, leaving users stuck on a 422.
     */
    /** @test */
    public function years_experience_must_be_an_integer(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'years_experience' => 1.5, 'proficiency' => 'expert'],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.years_experience', $validator->errors()->toArray());
    }
}