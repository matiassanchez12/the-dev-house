<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

final class ProjectInvitationAccepted extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        private readonly ProjectInvitation $projectInvitation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'project_invitation_accepted',
            'project_invitation_id' => $this->projectInvitation->id,
            'project_id' => $this->projectInvitation->project_id,
            'project_slug' => $this->projectInvitation->project->slug,
            'project_title' => $this->projectInvitation->project->title,
            'invited_user_id' => $this->projectInvitation->invited_user_id,
            'invited_user_name' => $this->projectInvitation->invitedUser->name,
        ];
    }
}
