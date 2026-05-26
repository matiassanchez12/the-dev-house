<?php

namespace Tests\Unit\Policies;

use App\Models\Project;
use App\Models\User;
use App\Policies\ProjectPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ProjectPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new ProjectPolicy();
    }

    public function test_owner_can_update_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $result = $this->policy->update($owner, $project);

        $this->assertTrue($result);
    }

    public function test_non_owner_cannot_update_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $result = $this->policy->update($otherUser, $project);

        $this->assertFalse($result);
    }

    public function test_owner_can_delete_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $result = $this->policy->delete($owner, $project);

        $this->assertTrue($result);
    }

    public function test_non_owner_cannot_delete_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $result = $this->policy->delete($otherUser, $project);

        $this->assertFalse($result);
    }

    public function test_manage_is_alias_for_update(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $manageResult = $this->policy->manage($owner, $project);
        $updateResult = $this->policy->update($owner, $project);

        $this->assertEquals($manageResult, $updateResult);
    }

    public function test_non_owner_cannot_manage_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $result = $this->policy->manage($otherUser, $project);

        $this->assertFalse($result);
    }
}