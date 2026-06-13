<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_access_the_dedicated_chat_page(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $message = Message::create([
            'project_id' => $project->id,
            'user_id' => $creator->id,
            'body' => 'Hola equipo',
            'type' => 'text',
        ]);

        $response = $this->actingAs($creator)->get(route('projects.chat', $project));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('projects/chat')
            ->where('project.id', $project->id)
            ->has('project.messages', 1)
            ->where('project.messages.0.id', $message->id)
            ->where('project.messages.0.body', 'Hola equipo')
        );
    }

    public function test_non_member_cannot_access_the_dedicated_chat_page(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $visitor = User::factory()->create();

        $response = $this->actingAs($visitor)->get(route('projects.chat', $project));

        $response->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_for_chat_page(): void
    {
        $project = Project::factory()->create();

        $response = $this->get(route('projects.chat', $project));

        $response->assertRedirect('/login');
    }

    public function test_sending_a_message_redirects_back_to_the_chat_page(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);

        $response = $this->actingAs($creator)->post(route('projects.messages.store', $project), [
            'body' => 'Mensaje de prueba',
        ]);

        $response->assertRedirect(route('projects.chat', $project));
        $this->assertDatabaseHas('messages', [
            'project_id' => $project->id,
            'user_id' => $creator->id,
            'body' => 'Mensaje de prueba',
        ]);
    }
}
