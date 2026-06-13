<?php

namespace Tests\Unit\Models;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_phase_belongs_to_project(): void
    {
        $project = Project::factory()->create(['user_id' => User::factory()->create()->id]);
        $phase = Phase::factory()->create(['project_id' => $project->id]);

        $this->assertTrue($phase->project->is($project));
    }

    public function test_phase_factory_creates_a_phase(): void
    {
        $phase = Phase::factory()->create();

        $this->assertDatabaseHas('phases', [
            'id' => $phase->id,
            'title' => $phase->title,
        ]);
    }
}
