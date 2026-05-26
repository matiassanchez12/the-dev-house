<?php

namespace Tests\Unit\Requests\Onboarding;

use App\Http\Requests\Onboarding\SaveStep1Request;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class SaveStep1RequestTest extends TestCase
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

    private function validateRequest(array $data): \Illuminate\Validation\Validator
    {
        $request = new SaveStep1Request();
        return Validator::make($data, $request->rules());
    }

    // === RED: Write failing tests first ===

    /** @test */
    public function techs_is_required(): void
    {
        $data = [];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_must_be_an_array(): void
    {
        $data = [
            'techs' => 'not-an-array',
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs', $validator->errors()->toArray());
    }

    /** @test */
    public function techs_must_have_at_least_one_item(): void
    {
        $data = [
            'techs' => [],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs', $validator->errors()->toArray());
    }

    /** @test */
    public function tech_item_must_have_id(): void
    {
        $data = [
            'techs' => [
                ['proficiency' => 3],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.id', $validator->errors()->toArray());
    }

    /** @test */
    public function tech_item_id_must_exist_in_techs_table(): void
    {
        $data = [
            'techs' => [
                ['id' => 99999, 'proficiency' => 3],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.id', $validator->errors()->toArray());
    }

    /** @test */
    public function tech_item_must_have_proficiency(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0]],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.proficiency', $validator->errors()->toArray());
    }

    /** @test */
    public function tech_item_proficiency_must_be_integer(): void
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

    /** @test */
    public function tech_item_proficiency_must_be_between_1_and_5(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 0],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.proficiency', $validator->errors()->toArray());
    }

    /** @test */
    public function tech_item_proficiency_6_fails(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 6],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('techs.0.proficiency', $validator->errors()->toArray());
    }

    // === GREEN: Tests pass with valid implementation ===

    /** @test */
    public function valid_single_tech_passes(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 3],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function valid_multiple_techs_passes(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 1],
                ['id' => $this->validTechIds[1], 'proficiency' => 3],
                ['id' => $this->validTechIds[2], 'proficiency' => 5],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function proficiency_boundary_values_pass(): void
    {
        $data = [
            'techs' => [
                ['id' => $this->validTechIds[0], 'proficiency' => 1],
                ['id' => $this->validTechIds[1], 'proficiency' => 5],
            ],
        ];

        $validator = $this->validateRequest($data);

        $this->assertFalse($validator->fails());
    }
}
