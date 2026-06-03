<?php

namespace App\Notifications;

use App\Models\JoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JoinRequestReceived extends Notification
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
            'type' => 'join_request_received',
            'join_request_id' => $this->joinRequest->id,
            'project_id' => $this->joinRequest->project_id,
            'project_slug' => $this->joinRequest->project->slug,
            'project_title' => $this->joinRequest->project->title,
            'applicant_id' => $this->joinRequest->user_id,
            'applicant_name' => $this->joinRequest->applicant->name,
        ];
    }
}
