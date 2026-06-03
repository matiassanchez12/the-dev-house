<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_can_transition_from_open_to_in_progress(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'open',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('projects.status.update', $project), [
                'status' => 'in_progress',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertEquals(ProjectStatus::InProgress, $project->fresh()->status);
    }

    public function test_creator_can_transition_from_in_progress_to_completed(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'in_progress',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('projects.status.update', $project), [
                'status' => 'completed',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertEquals(ProjectStatus::Completed, $project->fresh()->status);
    }

    public function test_creator_can_transition_from_open_to_closed(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'open',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('projects.status.update', $project), [
                'status' => 'closed',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertEquals(ProjectStatus::Closed, $project->fresh()->status);
    }

    public function test_creator_can_transition_from_in_progress_to_closed(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'in_progress',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('projects.status.update', $project), [
                'status' => 'closed',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertEquals(ProjectStatus::Closed, $project->fresh()->status);
    }

    public function test_creator_can_transition_from_completed_to_closed(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('projects.status.update', $project), [
                'status' => 'closed',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertEquals(ProjectStatus::Closed, $project->fresh()->status);
    }

    public function test_invalid_transition_returns_validation_error(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('projects.status.update', $project), [
                'status' => 'open',
            ]);

        $response->assertSessionHasErrors('status');
        $this->assertEquals(ProjectStatus::Completed, $project->fresh()->status);
    }

    public function test_non_creator_cannot_update_status(): void
    {
        $creator = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $response = $this
            ->actingAs($otherUser)
            ->patch(route('projects.status.update', $project), [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(403);
        $this->assertEquals('open', $project->fresh()->status->value);
    }

    public function test_guest_cannot_update_status(): void
    {
        $project = Project::factory()->create(['status' => 'open']);

        $response = $this->patch(route('projects.status.update', $project), [
            'status' => 'in_progress',
        ]);

        $response->assertRedirect(route('login'));
    }
}
