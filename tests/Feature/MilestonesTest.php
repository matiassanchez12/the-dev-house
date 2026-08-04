<?php

namespace Tests\Feature;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MilestonesTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_milestones_page_orders_completed_and_pending_phases_deterministically(): void
    {
        $creator = User::factory()->create(['name' => 'Project Creator']);

        $firstProject = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'First Project',
            'slug' => 'first-project',
        ]);

        $secondProject = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Second Project',
            'slug' => 'second-project',
        ]);

        $sharedCompletionTime = now()->subDay()->startOfHour();

        Phase::factory()->create([
            'project_id' => $firstProject->id,
            'title' => 'Same timestamp older id',
            'description' => 'Created first with the shared timestamp',
            'completed_at' => $sharedCompletionTime,
        ]);

        Phase::factory()->create([
            'project_id' => $secondProject->id,
            'title' => 'Same timestamp newer id',
            'description' => 'Created second with the shared timestamp',
            'completed_at' => $sharedCompletionTime,
        ]);

        Phase::factory()->create([
            'project_id' => $secondProject->id,
            'title' => 'Newest milestone',
            'description' => 'Latest release',
            'completed_at' => now()->subDay(),
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        Phase::factory()->create([
            'project_id' => $secondProject->id,
            'title' => 'Older pending milestone',
            'description' => 'Created first without a completion date',
            'completed_at' => null,
        ]);

        Phase::factory()->create([
            'project_id' => $firstProject->id,
            'title' => 'Newer pending milestone',
            'description' => 'Created second without a completion date',
            'completed_at' => null,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        $response = $this->get(route('milestones.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('milestones', false)
            ->has('milestones.data', 5)
            ->where('milestones.data.0.title', 'Newest milestone')
            ->where('milestones.data.0.project.title', 'Second Project')
            ->where('milestones.data.0.project.creator.name', 'Project Creator')
            ->where('milestones.data.1.title', 'Same timestamp newer id')
            ->where('milestones.data.2.title', 'Same timestamp older id')
            ->where('milestones.data.3.title', 'Newer pending milestone')
            ->where('milestones.data.4.title', 'Older pending milestone')
        );
    }
}
