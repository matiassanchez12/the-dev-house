<?php

namespace App\Notifications;

use App\Models\Phase;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ProjectUpdateNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        private readonly Phase $phase,
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
            'type' => 'project_update',
            'phase_id' => $this->phase->id,
            'phase_title' => $this->phase->title,
            'project_id' => $this->phase->project_id,
            'project_slug' => $this->phase->project->slug,
            'project_title' => $this->phase->project->title,
        ];
    }
}
