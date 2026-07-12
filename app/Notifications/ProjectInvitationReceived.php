<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class ProjectInvitationReceived extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        private readonly ProjectInvitation $projectInvitation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invitation = $this->projectInvitation;

        return (new MailMessage())
            ->subject("Project invitation: {$invitation->project->title}")
            ->view('emails.project-invitation-received', ['projectInvitation' => $invitation]);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toArray(object $notifiable): array
    {
        $invitation = $this->projectInvitation;

        return [
            'type' => 'project_invitation_received',
            'project_invitation_id' => $invitation->id,
            'project_id' => $invitation->project_id,
            'project_slug' => (string) $invitation->project->slug,
            'project_title' => $invitation->project->title,
            'inviter_id' => $invitation->project->user_id,
            'inviter_name' => $invitation->project->creator->name,
            'invited_user_id' => $invitation->invited_user_id,
            'invited_user_name' => $invitation->invitedUser->name,
            'message' => $invitation->message,
        ];
    }
}
