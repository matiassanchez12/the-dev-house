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

    public function test_public_milestones_page_shows_recent_completed_phases(): void
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

        Phase::factory()->create([
            'project_id' => $firstProject->id,
            'title' => 'Old milestone',
            'description' => 'Already shipped',
            'completed_at' => now()->subDays(2),
        ]);

        Phase::factory()->create([
            'project_id' => $secondProject->id,
            'title' => 'Newest milestone',
            'description' => 'Latest release',
            'completed_at' => now()->subDay(),
        ]);

        Phase::factory()->create([
            'project_id' => $secondProject->id,
            'title' => 'Pending milestone',
            'description' => 'Not finished yet',
            'completed_at' => null,
        ]);

        $response = $this->get(route('milestones.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('public/milestones')
            ->has('milestones.data', 2)
            ->where('milestones.data.0.title', 'Newest milestone')
            ->where('milestones.data.0.project.title', 'Second Project')
            ->where('milestones.data.0.project.creator.name', 'Project Creator')
            ->where('milestones.data.1.title', 'Old milestone')
        );
    }
}
