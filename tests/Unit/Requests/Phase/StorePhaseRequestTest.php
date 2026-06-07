<?php

namespace Tests\Unit\Requests\Phase;

use App\Http\Requests\Phase\StorePhaseRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StorePhaseRequestTest extends TestCase
{
    use RefreshDatabase;

    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new StorePhaseRequest();

        return Validator::make($data, $request->rules());
    }

    public function test_title_is_required(): void
    {
        $validator = $this->validateRequest([]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    public function test_title_must_not_exceed_120_characters(): void
    {
        $validator = $this->validateRequest(['title' => str_repeat('a', 121)]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    public function test_description_may_be_empty(): void
    {
        $validator = $this->validateRequest(['title' => 'Phase']);

        $this->assertFalse($validator->fails());
    }

    public function test_completed_at_must_be_a_date_when_provided(): void
    {
        $validator = $this->validateRequest([
            'title' => 'Phase',
            'completed_at' => 'not-a-date',
        ]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('completed_at', $validator->errors()->toArray());
    }
}
