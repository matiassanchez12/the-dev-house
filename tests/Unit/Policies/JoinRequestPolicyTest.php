<?php

namespace Tests\Unit\Policies;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use App\Policies\JoinRequestPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JoinRequestPolicyTest extends TestCase
{
    use RefreshDatabase;

    private JoinRequestPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new JoinRequestPolicy();
    }

    public function test_project_owner_can_approve_request(): void
    {
        $owner = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->approve($owner, $joinRequest);

        $this->assertTrue($result);
    }

    public function test_non_owner_cannot_approve_request(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->approve($otherUser, $joinRequest);

        $this->assertFalse($result);
    }

    public function test_project_owner_can_reject_request(): void
    {
        $owner = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->reject($owner, $joinRequest);

        $this->assertTrue($result);
    }

    public function test_non_owner_cannot_reject_request(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->reject($otherUser, $joinRequest);

        $this->assertFalse($result);
    }

    public function test_applicant_can_cancel_own_request(): void
    {
        $owner = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->cancel($applicant, $joinRequest);

        $this->assertTrue($result);
    }

    public function test_non_applicant_cannot_cancel_request(): void
    {
        $owner = User::factory()->create();
        $applicant = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->cancel($otherUser, $joinRequest);

        $this->assertFalse($result);
    }

    public function test_project_owner_cannot_cancel_request(): void
    {
        $owner = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $result = $this->policy->cancel($owner, $joinRequest);

        $this->assertFalse($result);
    }
}