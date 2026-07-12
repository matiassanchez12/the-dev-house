<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationAccepted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

final class ProjectInvitationResponseFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_invited_user_can_accept_a_pending_invitation_from_the_project_show_flow(): void
    {
        Notification::fake();

        $creator = User::factory()->create();
        $invitedUser = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'accept-flow-project',
        ]);
        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($invitedUser)->post(route('project-invitations.accept', $invitation));

        $response->assertRedirect(route('projects.show', $project));
        $this->assertDatabaseHas('project_invitations', [
            'id' => $invitation->id,
            'status' => ProjectInvitation::STATUS_ACCEPTED,
        ]);
        $this->assertDatabaseHas('project_participants', [
            'project_id' => $project->id,
            'user_id' => $invitedUser->id,
        ]);
        Notification::assertSentTo($creator, ProjectInvitationAccepted::class);
    }

    public function test_invited_user_can_reject_a_pending_invitation_from_the_project_show_flow(): void
    {
        $creator = User::factory()->create();
        $invitedUser = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'reject-flow-project',
        ]);
        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($invitedUser)->post(route('project-invitations.reject', $invitation));

        $response->assertRedirect(route('projects.show', $project));
        $this->assertDatabaseHas('project_invitations', [
            'id' => $invitation->id,
            'status' => ProjectInvitation::STATUS_REJECTED,
        ]);
        $this->assertDatabaseMissing('project_participants', [
            'project_id' => $project->id,
            'user_id' => $invitedUser->id,
        ]);
    }
}
