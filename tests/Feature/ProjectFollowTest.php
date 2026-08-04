<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectUpdateNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

final class ProjectFollowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_follow_project_and_view_follow_state(): void
    {
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'followable-project',
        ]);

        $this->actingAs($viewer)
            ->post(route('projects.follow', $project))
            ->assertRedirect();

        $this->assertDatabaseHas('project_follows', [
            'project_id' => $project->id,
            'user_id' => $viewer->id,
        ]);

        $this->actingAs($viewer)
            ->get(route('projects.show', $project))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->where('project.followers_count', 1)
                ->where('project.is_followed_by_viewer', true)
                ->where('project.has_unread_public_updates', false));
    }

    public function test_authenticated_user_can_unfollow_project_and_view_follow_state(): void
    {
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'followed-project',
        ]);

        $project->followers()->attach($viewer->id);

        $this->actingAs($viewer)
            ->delete(route('projects.unfollow', $project))
            ->assertRedirect();

        $this->assertDatabaseMissing('project_follows', [
            'project_id' => $project->id,
            'user_id' => $viewer->id,
        ]);

        $this->actingAs($viewer)
            ->get(route('projects.show', $project))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->where('project.followers_count', 0)
                ->where('project.is_followed_by_viewer', false));
    }

    public function test_follow_and_unfollow_actions_are_idempotent(): void
    {
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'idempotent-project',
        ]);

        $this->actingAs($viewer)
            ->post(route('projects.follow', $project))
            ->assertRedirect();

        $this->actingAs($viewer)
            ->post(route('projects.follow', $project))
            ->assertRedirect();

        $this->assertDatabaseCount('project_follows', 1);

        $this->actingAs($viewer)
            ->delete(route('projects.unfollow', $project))
            ->assertRedirect();

        $this->actingAs($viewer)
            ->delete(route('projects.unfollow', $project))
            ->assertRedirect();

        $this->assertDatabaseCount('project_follows', 0);
    }

    public function test_follow_action_remains_successful_when_follow_row_already_exists(): void
    {
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'existing-follow-row-project',
        ]);

        $project->followers()->attach($viewer->id);

        $this->actingAs($viewer)
            ->post(route('projects.follow', $project))
            ->assertRedirect();

        $this->assertDatabaseCount('project_follows', 1);
        $this->assertDatabaseHas('project_follows', [
            'project_id' => $project->id,
            'user_id' => $viewer->id,
        ]);
    }

    public function test_project_creator_cannot_follow_own_project(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'owned-project',
        ]);

        $this->actingAs($creator)
            ->post(route('projects.follow', $project))
            ->assertSessionHasErrors('follow');

        $this->assertDatabaseMissing('project_follows', [
            'project_id' => $project->id,
            'user_id' => $creator->id,
        ]);
    }

    public function test_project_creator_self_follow_attempt_removes_pre_existing_follow_row(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'legacy-owned-project',
        ]);

        $project->followers()->attach($creator->id);

        $this->actingAs($creator)
            ->post(route('projects.follow', $project))
            ->assertSessionHasErrors('follow');

        $this->assertDatabaseMissing('project_follows', [
            'project_id' => $project->id,
            'user_id' => $creator->id,
        ]);
    }

    public function test_guest_viewer_sees_project_follower_count(): void
    {
        $creator = User::factory()->create();
        $follower = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'popular-project',
        ]);

        $project->followers()->attach($follower->id);

        $this->get(route('projects.show', $project))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->where('project.followers_count', 1)
                ->missing('project.is_followed_by_viewer'));
    }

    public function test_project_show_shows_unread_when_notification_exists_and_read_after_marking(): void
    {
        $creator = User::factory()->create();
        $viewer = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'read-state-project',
        ]);

        $project->followers()->attach($viewer->id);

        $phase = Phase::factory()->create([
            'project_id' => $project->id,
            'title' => 'Fresh milestone',
            'description' => 'New public update',
        ]);

        // Simulate unread notification
        $viewer->notify(new ProjectUpdateNotification($phase));

        $this->actingAs($viewer)
            ->get(route('projects.show', $project))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->where('project.has_unread_public_updates', true));

        // Mark all notifications as read
        $this->actingAs($viewer)
            ->patch(route('notifications.read', $viewer->notifications->first()->id));

        $this->actingAs($viewer)
            ->get(route('projects.show', $project))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->where('project.has_unread_public_updates', false));
    }

    public function test_follow_routes_remain_reachable_for_public_project_slugs(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'slug' => 'route-regression-project',
        ]);

        $this->post(route('projects.follow', $project))
            ->assertRedirect(route('login'));

        $this->assertDatabaseCount('project_follows', 0);

        $this->delete(route('projects.unfollow', $project))
            ->assertRedirect(route('login'));

        $this->assertDatabaseCount('project_follows', 0);
    }
}
