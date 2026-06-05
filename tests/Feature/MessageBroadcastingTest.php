<?php

namespace Tests\Feature;

use App\Events\MessageCreated;
use App\Models\Message;
use App\Models\Project;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        $event = new MessageCreated($message);
        $channels = $event->broadcastOn();

        $this->assertCount(1, $channels);
        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-project.' . $project->id, $channels[0]->name);
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

        $event = new MessageCreated($message);

        $channels = $event->broadcastOn();

        $this->assertContainsOnlyInstancesOf(PrivateChannel::class, $channels);
    }
}
