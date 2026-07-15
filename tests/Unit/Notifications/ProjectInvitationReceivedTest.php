<?php

declare(strict_types=1);

namespace Tests\Unit\Notifications;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectInvitationReceivedTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_invitation_received_uses_expected_channels(): void
    {
        $payload = $this->makeNotificationPayload();
        $notification = $payload['notification'];

        self::assertSame(['database', 'mail', 'broadcast'], $notification->via($payload['invited_user']));
    }

    public function test_project_invitation_received_skips_mail_when_user_disables_optional_emails(): void
    {
        $payload = $this->makeNotificationPayload(notificationSettings: ['collaboration_emails' => false]);

        self::assertSame(['database', 'broadcast'], $payload['notification']->via($payload['invited_user']));
    }

    public function test_project_invitation_received_prefers_new_notification_settings_over_legacy_privacy_settings(): void
    {
        $payload = $this->makeNotificationPayload(
            privacySettings: ['email_notifications_enabled' => false],
            notificationSettings: ['collaboration_emails' => true],
        );

        self::assertSame(['database', 'mail', 'broadcast'], $payload['notification']->via($payload['invited_user']));
    }

    public function test_project_invitation_received_payload_includes_project_and_inviter_data(): void
    {
        $payload = $this->makeNotificationPayload();
        $notification = $payload['notification'];

        $data = $notification->toArray($payload['invited_user']);

        self::assertSame('project_invitation_received', $data['type']);
        self::assertSame($payload['invitation']->id, $data['project_invitation_id']);
        self::assertSame((string) $payload['project']->slug, $data['project_slug']);
        self::assertSame($payload['project']->title, $data['project_title']);
        self::assertSame($payload['project']->creator->id, $data['inviter_id']);
        self::assertSame($payload['project']->creator->name, $data['inviter_name']);
    }

    public function test_project_invitation_received_to_mail_targets_the_project_title(): void
    {
        $payload = $this->makeNotificationPayload();
        $notification = $payload['notification'];

        $mailMessage = $notification->toMail($payload['invited_user']);

        self::assertStringContainsString($payload['project']->title, $mailMessage->subject);
        self::assertSame('emails.project-invitation-received', $mailMessage->view);
    }

    private function makeNotificationPayload(array $privacySettings = [], array $notificationSettings = []): array
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $owner->id,
            'status' => 'open',
        ]);
        $invitedUser = User::factory()->create();

        if ($privacySettings !== []) {
            $invitedUser->privacySetting()->create($privacySettings);
        }

        if ($notificationSettings !== []) {
            $invitedUser->notificationSetting()->create($notificationSettings);
        }

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'We would like to work with you.',
            'status' => 'pending',
        ]);

        return [
            'notification' => new ProjectInvitationReceived($invitation),
            'project' => $project->load('creator'),
            'invitation' => $invitation,
            'invited_user' => $invitedUser,
        ];
    }
}
