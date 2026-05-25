<?php

namespace Tests\Unit\Requests\JoinRequest;

use App\Http\Requests\JoinRequest\StoreJoinRequestRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreJoinRequestRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper to make a Validator instance from the request with given data.
     */
    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new StoreJoinRequestRequest();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function message_is_required(): void
    {
        $data = [];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    /** @test */
    public function message_must_be_at_least_10_characters(): void
    {
        $data = [
            'message' => 'Short',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    /** @test */
    public function message_must_not_exceed_500_characters(): void
    {
        $data = [
            'message' => str_repeat('a', 501),
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    /** @test */
    public function message_must_be_a_string(): void
    {
        $data = [
            'message' => ['array' => 'not a string'],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_message_passes_validation(): void
    {
        $data = [
            'message' => 'This is a valid message with more than 10 characters.',
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function message_at_exactly_10_characters_passes(): void
    {
        $data = [
            'message' => '0123456789', // exactly 10
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function message_at_exactly_500_characters_passes(): void
    {
        $data = [
            'message' => str_repeat('a', 500),
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}