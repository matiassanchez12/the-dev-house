<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Message $message,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new \Illuminate\Broadcasting\Channel('project.' . $this->message->project_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'body' => $this->message->body,
            'type' => $this->message->type,
            'file_url' => $this->message->file_url,
            'user' => [
                'id' => $this->message->user_id,
                'name' => $this->message->sender->name,
                'avatar' => $this->message->sender->avatar,
            ],
            'created_at' => $this->message->created_at->toIso8601String(),
        ];
    }
}
