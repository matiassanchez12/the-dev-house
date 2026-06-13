<?php

namespace Tests\Unit\Policies;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use App\Policies\PhasePolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhasePolicyTest extends TestCase
{
    use RefreshDatabase;

    private PhasePolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new PhasePolicy();
    }

    public function test_project_member_can_view_phase(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $project->participants()->attach($member->id, ['role' => 'developer', 'joined_at' => now()]);
        $phase = Phase::factory()->create(['project_id' => $project->id]);

        $this->assertTrue($this->policy->view($member, $phase));
    }

    public function test_non_member_cannot_view_phase(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $phase = Phase::factory()->create(['project_id' => $project->id]);

        $this->assertFalse($this->policy->view($other, $phase));
    }

    public function test_project_owner_can_create_phase(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $this->assertTrue($this->policy->create($owner, $project));
    }

    public function test_non_owner_cannot_create_phase(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($this->policy->create($other, $project));
    }
}
