<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tech;

class UserTechTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression test for #30: years_experience must be returned as int
     * from the pivot, not as the raw string the DB returns by default.
     */
    public function test_years_experience_is_cast_to_integer()
    {
        $user = User::factory()->create();
        $tech = Tech::factory()->create();

        $user->techs()->attach($tech, ['years_experience' => 3, 'proficiency' => 'expert']);

        $pivot = $user->techs()->where('tech_id', $tech->id)->first()->pivot;

        $this->assertIsInt($pivot->years_experience);
        $this->assertEquals(3, $pivot->years_experience);
    }
}
