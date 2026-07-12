<?php

declare(strict_types=1);

namespace Tests\Unit\Notifications;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationAccepted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectInvitationAcceptedTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_invitation_accepted_uses_database_and_broadcast_channels(): void
    {
        $payload = $this->makeNotificationPayload();

        self::assertSame(['database', 'broadcast'], $payload['notification']->via($payload['creator']));
    }

    public function test_project_invitation_accepted_payload_includes_project_and_user_data(): void
    {
        $payload = $this->makeNotificationPayload();

        $data = $payload['notification']->toArray($payload['creator']);

        self::assertSame('project_invitation_accepted', $data['type']);
        self::assertSame($payload['invitation']->id, $data['project_invitation_id']);
        self::assertSame((string) $payload['project']->slug, $data['project_slug']);
        self::assertSame($payload['project']->title, $data['project_title']);
        self::assertSame($payload['invited_user']->id, $data['invited_user_id']);
        self::assertSame($payload['invited_user']->name, $data['invited_user_name']);
    }

    private function makeNotificationPayload(): array
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);
        $invitedUser = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'We would like to work with you.',
            'status' => ProjectInvitation::STATUS_ACCEPTED,
            'responded_at' => now(),
        ])->load(['project.creator', 'invitedUser']);

        return [
            'notification' => new ProjectInvitationAccepted($invitation),
            'project' => $project->load('creator'),
            'invitation' => $invitation,
            'invited_user' => $invitedUser,
            'creator' => $creator,
        ];
    }
}
