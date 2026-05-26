<?php

namespace Tests\Unit\Requests\Onboarding;

use App\Http\Requests\Onboarding\SaveStep4Request;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class SaveStep4RequestTest extends TestCase
{
    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new SaveStep4Request();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function non_array_fails(): void
    {
        $data = [
            'join_requests' => 'not-an-array',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('join_requests', $validator->errors()->toArray());
    }

    /** @test */
    public function array_with_non_integers_fails(): void
    {
        $data = [
            'join_requests' => [1, 'two', 3],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        // Error is on the specific item index, not on join_requests itself
        $errors = $validator->errors()->toArray();
        $this->assertTrue(
            isset($errors['join_requests.1']) || isset($errors['join_requests']),
            'Expected error on join_requests.1 or join_requests'
        );
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_join_requests_array_passes(): void
    {
        $data = [
            'join_requests' => [1, 2, 3],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function empty_array_passes(): void
    {
        $data = [
            'join_requests' => [],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function null_passes(): void
    {
        $data = [
            'join_requests' => null,
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function no_join_requests_field_passes(): void
    {
        $data = [];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function single_integer_passes(): void
    {
        $data = [
            'join_requests' => [42],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}
