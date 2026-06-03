<?php

namespace Tests\Feature;

use App\Events\MessageCreated;
use App\Models\Message;
use App\Models\Project;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class MessageBroadcastingTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_created_broadcasts_on_private_channel(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user, 'creator')->create();
        $message = Message::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'body' => 'hola',
            'type' => 'text',
        ]);

        Event::fake([MessageCreated::class]);

        event(new MessageCreated($message));

        Event::assertDispatched(MessageCreated::class, function (MessageCreated $event) use ($project) {
            $channels = $event->broadcastOn();

            return count($channels) === 1
                && $channels[0] instanceof PrivateChannel
                && $channels[0]->name === 'project.' . $project->id;
        });
    }

    public function test_message_created_does_not_broadcast_on_public_channel(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user, 'creator')->create();
        $message = Message::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'body' => 'hola',
            'type' => 'text',
        ]);

        Event::fake([MessageCreated::class]);

        event(new MessageCreated($message));

        Event::assertDispatched(MessageCreated::class, function (MessageCreated $event) {
            foreach ($event->broadcastOn() as $channel) {
                if ($channel instanceof Channel && ! $channel instanceof PrivateChannel) {
                    return false;
                }
            }

            return true;
        });
    }
}
