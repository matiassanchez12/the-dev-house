<?php

namespace Tests\Unit\Services;

use App\Models\Tech;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new UserService();
        $this->user = User::factory()->create();
    }

    /**
     * Regression test for #30: years_experience must be cast to integer on
     * the pivot so sortByDesc compares numerically. Without the cast, the
     * pivot returns a string and lexicographic ordering puts "10" before "2".
     */
    public function test_sorts_techs_by_years_experience_descending_with_multidigit_values(): void
    {
        $react = Tech::factory()->create(['name' => 'React']);
        $laravel = Tech::factory()->create(['name' => 'Laravel']);
        $typescript = Tech::factory()->create(['name' => 'TypeScript']);

        $this->user->techs()->attach($react->id, ['years_experience' => 2,  'proficiency' => 'basic']);
        $this->user->techs()->attach($laravel->id, ['years_experience' => 10, 'proficiency' => 'expert']);
        $this->user->techs()->attach($typescript->id, ['years_experience' => 5,  'proficiency' => 'advanced']);

        $techs = $this->service->getPublicProfile($this->user)['techs'];

        $this->assertEquals([10, 5, 2], array_column($techs, 'years'));
    }
}
