<?php

namespace App\Notifications;

use App\Models\JoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JoinRequestRejected extends Notification
{
    use Queueable;

    public function __construct(
        private readonly JoinRequest $joinRequest,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'join_request_rejected',
            'join_request_id' => $this->joinRequest->id,
            'project_id' => $this->joinRequest->project_id,
            'project_slug' => $this->joinRequest->project->slug,
            'project_title' => $this->joinRequest->project->title,
        ];
    }
}
