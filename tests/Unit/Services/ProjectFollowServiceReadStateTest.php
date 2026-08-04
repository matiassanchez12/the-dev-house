<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectUpdateNotification;
use App\Services\ProjectFollowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectFollowServiceReadStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_follow_initializes_follow_row(): void
    {
        $service = app(ProjectFollowService::class);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
        ]);

        $service->follow($project, $viewer);

        $this->assertDatabaseHas('project_follows', [
            'project_id' => $project->id,
            'user_id' => $viewer->id,
        ]);
    }

    public function test_has_unread_public_updates_returns_true_when_unread_notification_exists(): void
    {
        $service = app(ProjectFollowService::class);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
        ]);

        $project->followers()->attach($viewer->id);

        $phase = Phase::factory()->create([
            'project_id' => $project->id,
            'title' => 'Fresh milestone',
        ]);

        $viewer->notify(new ProjectUpdateNotification($phase));

        $this->assertTrue($service->hasUnreadPublicUpdates($project, $viewer));
    }

    public function test_has_unread_public_updates_returns_false_when_notification_is_read(): void
    {
        $service = app(ProjectFollowService::class);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
        ]);

        $project->followers()->attach($viewer->id);

        $phase = Phase::factory()->create([
            'project_id' => $project->id,
            'title' => 'Fresh milestone',
        ]);

        $notification = $viewer->notify(new ProjectUpdateNotification($phase));
        $viewer->notifications->first()->markAsRead();

        $this->assertFalse($service->hasUnreadPublicUpdates($project, $viewer));
    }

    public function test_has_unread_public_updates_returns_false_when_no_notification_exists(): void
    {
        $service = app(ProjectFollowService::class);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
        ]);

        $project->followers()->attach($viewer->id);

        $this->assertFalse($service->hasUnreadPublicUpdates($project, $viewer));
    }

    public function test_unread_flags_for_projects_returns_bulk_map(): void
    {
        $service = app(ProjectFollowService::class);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $followedProject = Project::factory()->create([
            'user_id' => $creator->id,
        ]);
        $otherProject = Project::factory()->create([
            'user_id' => $creator->id,
        ]);

        $followedProject->followers()->attach($viewer->id);

        $phase = Phase::factory()->create([
            'project_id' => $followedProject->id,
            'title' => 'Fresh milestone',
        ]);

        $viewer->notify(new ProjectUpdateNotification($phase));

        $flags = $service->unreadFlagsForProjects([$followedProject->id, $otherProject->id], $viewer);

        $this->assertSame([
            $followedProject->id => true,
            $otherProject->id => false,
        ], $flags);
    }

    public function test_unread_flags_for_projects_returns_false_when_all_notifications_are_read(): void
    {
        $service = app(ProjectFollowService::class);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
        ]);

        $project->followers()->attach($viewer->id);

        $phase = Phase::factory()->create([
            'project_id' => $project->id,
            'title' => 'Fresh milestone',
        ]);

        $viewer->notify(new ProjectUpdateNotification($phase));
        $viewer->notifications->each->markAsRead();

        $flags = $service->unreadFlagsForProjects([$project->id], $viewer);

        $this->assertSame([
            $project->id => false,
        ], $flags);
    }
}
