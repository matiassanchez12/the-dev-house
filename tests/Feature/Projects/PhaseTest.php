<?php

namespace Tests\Feature\Projects;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_when_creating_phase(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);

        $response = $this->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_project_creator_can_create_phase(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $completedAt = '2026-06-06';

        $response = $this->actingAs($creator)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
            'description' => 'Validated the idea',
            'completed_at' => $completedAt,
        ]);

        $response->assertRedirect(route('projects.show', $project));

        $phase = Phase::query()->where('project_id', $project->id)->firstOrFail();

        $this->assertSame($completedAt, $phase->completed_at?->toDateString());
        $this->assertSame('Discovery', $phase->title);
        $this->assertSame('Validated the idea', $phase->description);
    }

    public function test_project_member_cannot_create_phase(): void
    {
        $creator = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $project->participants()->attach($member->id, ['role' => 'developer', 'joined_at' => now()]);

        $response = $this->actingAs($member)->post(route('projects.phases.store', $project), [
            'title' => 'Discovery',
        ]);

        $response->assertStatus(403);
    }

    public function test_project_creator_can_update_phase(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $phase = Phase::factory()->create(['project_id' => $project->id, 'title' => 'Discovery']);
        $completedAt = '2026-06-07';

        $response = $this->actingAs($creator)->put(route('projects.phases.update', [$project, $phase]), [
            'title' => 'Delivery',
            'description' => 'Shipped the MVP',
            'completed_at' => $completedAt,
        ]);

        $response->assertRedirect(route('projects.show', $project));

        $phase->refresh();

        $this->assertSame($completedAt, $phase->completed_at?->toDateString());
        $this->assertSame('Delivery', $phase->title);
        $this->assertSame('Shipped the MVP', $phase->description);
    }

    public function test_project_creator_can_delete_phase(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $phase = Phase::factory()->create(['project_id' => $project->id]);

        $response = $this->actingAs($creator)->delete(route('projects.phases.destroy', [$project, $phase]));

        $response->assertRedirect(route('projects.show', $project));
        $this->assertDatabaseMissing('phases', ['id' => $phase->id]);
    }
}
