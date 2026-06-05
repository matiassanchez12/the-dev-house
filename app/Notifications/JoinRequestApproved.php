<?php

namespace App\Notifications;

use App\Models\JoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinRequestApproved extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        private readonly JoinRequest $joinRequest,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $jr = $this->joinRequest;

        return (new MailMessage())
            ->subject("¡Tu solicitud para {$jr->project->title} fue aprobada!")
            ->view('emails.join-request-approved', ['joinRequest' => $jr]);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'join_request_approved',
            'join_request_id' => $this->joinRequest->id,
            'project_id' => $this->joinRequest->project_id,
            'project_slug' => $this->joinRequest->project->slug,
            'project_title' => $this->joinRequest->project->title,
        ];
    }
}
