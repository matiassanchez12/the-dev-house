<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectUpdateNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class MilestonesReadStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_milestones_index_shows_unread_for_followed_projects_with_notifications(): void
    {
        $creator = User::factory()->create();
        $viewer = User::factory()->create();

        $projects = [];

        for ($index = 1; $index <= 13; $index++) {
            $project = Project::factory()->create([
                'user_id' => $creator->id,
                'slug' => 'project-' . $index,
            ]);

            $projects[] = $project;

            Phase::factory()->create([
                'project_id' => $project->id,
                'title' => 'Milestone ' . $index,
                // Keep every milestone pending so list order is deterministic (id desc);
                // the factory otherwise randomises completed_at, which reorders the feed.
                'completed_at' => null,
                'created_at' => now()->subMinutes(13 - $index),
                'updated_at' => now()->subMinutes(13 - $index),
            ]);
        }

        $visibleProject = $projects[12];
        $otherProject = $projects[11];

        $visibleProject->followers()->attach($viewer->id);
        $otherProject->followers()->attach($viewer->id);

        // Create unread notification for visible project only
        $visiblePhase = $visibleProject->phases()->first();
        $viewer->notify(new ProjectUpdateNotification($visiblePhase));

        $response = $this->actingAs($viewer)->get(route('milestones.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('milestones', false)
            ->has('milestones.data', 12)
            // First milestone is from visibleProject (most recent), which has unread notification
            ->where('milestones.data.0.project.has_unread_public_updates', true));
    }
}
