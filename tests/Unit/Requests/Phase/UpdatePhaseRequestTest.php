<?php

namespace Tests\Unit\Requests\Phase;

use App\Http\Requests\Phase\UpdatePhaseRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdatePhaseRequestTest extends TestCase
{
    use RefreshDatabase;

    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new UpdatePhaseRequest();

        return Validator::make($data, $request->rules());
    }

    public function test_title_is_required(): void
    {
        $validator = $this->validateRequest([]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    public function test_description_must_be_string_when_provided(): void
    {
        $validator = $this->validateRequest([
            'title' => 'Phase',
            'description' => ['bad'],
        ]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('description', $validator->errors()->toArray());
    }
}
