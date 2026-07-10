<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Policies\ProjectInvitationPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectInvitationPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ProjectInvitationPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new ProjectInvitationPolicy();
    }

    public function test_project_owner_can_create_invitations_for_their_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        self::assertTrue($this->policy->create($owner, $project));
    }

    public function test_non_owner_cannot_create_invitations_for_a_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        self::assertFalse($this->policy->create($otherUser, $project));
    }

    public function test_project_owner_can_cancel_their_project_invitation(): void
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertTrue($this->policy->cancel($owner, $invitation));
    }

    public function test_non_owner_cannot_cancel_a_project_invitation(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $invitedUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertFalse($this->policy->cancel($otherUser, $invitation));
    }
}
