<?php

namespace App\Notifications;

use App\Models\JoinRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinRequestRejected extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        private readonly JoinRequest $joinRequest,
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable instanceof User && ! $notifiable->receivesOptionalEmailNotifications()
            ? ['database', 'broadcast']
            : ['database', 'mail', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $jr = $this->joinRequest;

        return (new MailMessage)
            ->subject("The Dev House: solicitud rechazada para {$jr->project->title}")
            ->view('emails.join-request-rejected', ['joinRequest' => $jr]);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
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
