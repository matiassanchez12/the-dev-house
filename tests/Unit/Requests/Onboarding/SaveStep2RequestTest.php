<?php

namespace Tests\Unit\Requests\Onboarding;

use App\Http\Requests\Onboarding\SaveStep2Request;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class SaveStep2RequestTest extends TestCase
{
    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new SaveStep2Request();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function bio_exceeds_1000_characters_fails(): void
    {
        $data = [
            'bio' => str_repeat('a', 1001),
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('bio', $validator->errors()->toArray());
    }

    /** @test */
    public function bio_not_string_fails(): void
    {
        $data = [
            'bio' => 12345,
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('bio', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_bio_passes(): void
    {
        $data = [
            'bio' => 'This is my developer bio.',
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function bio_null_passes(): void
    {
        $data = [
            'bio' => null,
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function bio_empty_passes(): void
    {
        $data = [
            'bio' => '',
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function no_bio_field_passes(): void
    {
        $data = [];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function bio_at_1000_characters_passes(): void
    {
        $data = [
            'bio' => str_repeat('a', 1000),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}
