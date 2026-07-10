<?php

declare(strict_types=1);

namespace Tests\Unit\Models;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;

final class ProjectInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_invitation_belongs_to_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertTrue($invitation->project->is($project));
    }

    public function test_project_invitation_belongs_to_invited_user(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertTrue($invitation->invitedUser->is($invitedUser));
    }

    public function test_project_can_access_invitations(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertTrue($project->invitations->first()->is($invitation));
    }

    public function test_user_can_access_received_invitations(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertTrue($invitedUser->receivedInvitations->first()->is($invitation));
    }

    public function test_pending_invitation_is_unique_per_project_and_user(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        $this->expectException(QueryException::class);

        ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project again.',
            'status' => 'pending',
        ]);
    }

    public function test_cancelled_invitation_does_not_block_new_pending_invitation(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        self::assertSame('pending', $invitation->status);
    }

    public function test_repeated_cancelled_invitations_do_not_block_future_pending_invitations(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        $firstInvitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        $firstInvitation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $secondInvitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project again.',
            'status' => 'pending',
        ]);

        $secondInvitation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $thirdInvitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us once more.',
            'status' => 'pending',
        ]);

        self::assertSame('pending', $thirdInvitation->status);
    }
}
