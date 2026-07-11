<?php

namespace Tests\Unit\Requests\Onboarding;

use App\Http\Requests\Onboarding\SaveStep3Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class SaveStep3RequestTest extends TestCase
{
    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new SaveStep3Request();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function non_image_file_fails(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('document.pdf', 100),
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('avatar', $validator->errors()->toArray());
    }

    /** @test */
    public function file_larger_than_2mb_fails(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('large_avatar.jpg', 3000), // 3MB
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('avatar', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_image_jpg_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_image_png_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.png', 100, 'image/png'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_image_webp_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.webp', 100, 'image/webp'),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function no_avatar_passes(): void
    {
        $data = [];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function null_avatar_passes(): void
    {
        $data = [
            'avatar' => null,
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function avatar_at_exactly_2mb_passes(): void
    {
        $data = [
            'avatar' => UploadedFile::fake()->create('avatar.jpg', 2048), // 2MB exactly
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}
