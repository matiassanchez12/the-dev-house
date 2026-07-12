<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\Tech;
use App\Models\User;
use App\Notifications\ProjectInvitationReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

final class ProjectCollaboratorFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Project $project;
    private Tech $react;
    private Tech $laravel;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->project = Project::factory()->create(['user_id' => $this->owner->id]);
        $this->react = Tech::factory()->create(['slug' => 'react']);
        $this->laravel = Tech::factory()->create(['slug' => 'laravel']);
        $this->project->techs()->attach([$this->react->id, $this->laravel->id]);
    }

    public function test_project_creator_is_redirected_to_the_collaborators_page_after_creation(): void
    {
        $response = $this->actingAs($this->owner)->post('/projects', [
            'title' => 'Contextual Invitations App',
            'description' => 'Build a collaboration workflow',
            'vision' => 'Invite the right people',
            'techs' => [$this->react->id, $this->laravel->id],
        ]);

        $project = Project::where('title', 'Contextual Invitations App')->firstOrFail();

        $response->assertRedirect(route('projects.collaborators', $project));
        $response->assertSessionHas('success');
    }

    public function test_creator_can_view_suggestions_and_pending_invitations(): void
    {
        $suggestedUser = User::factory()->create();
        $suggestedUser->techs()->attach($this->react->id);

        $pendingInvitee = User::factory()->create();
        ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $pendingInvitee->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->owner)->get(route('projects.collaborators', $this->project));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('projects/collaborators')
            ->where('project.slug', (string) $this->project->slug)
            ->has('suggestions', 1)
            ->where('suggestions.0.user.id', $suggestedUser->id)
            ->has('pendingInvitations', 1)
            ->where('pendingInvitations.0.invited_user.id', $pendingInvitee->id)
        );
    }

    public function test_non_owner_cannot_view_the_collaborators_page(): void
    {
        $response = $this->actingAs(User::factory()->create())->get(route('projects.collaborators', $this->project));

        $response->assertStatus(403);
    }

    public function test_creator_can_send_project_invitation(): void
    {
        Notification::fake();

        $recipient = User::factory()->create();
        $recipient->techs()->attach($this->react->id);

        $response = $this->actingAs($this->owner)->post(route('project-invitations.store', $this->project), [
            'invited_user_id' => $recipient->id,
            'message' => 'We would love to collaborate with you.',
        ]);

        $response->assertRedirect(route('projects.collaborators', $this->project));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('project_invitations', [
            'project_id' => $this->project->id,
            'invited_user_id' => $recipient->id,
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        Notification::assertSentTo($recipient, ProjectInvitationReceived::class);
    }

    public function test_non_owner_cannot_create_project_invitation(): void
    {
        $recipient = User::factory()->create();
        $recipient->techs()->attach($this->react->id);

        $response = $this->actingAs(User::factory()->create())->post(route('project-invitations.store', $this->project), [
            'invited_user_id' => $recipient->id,
            'message' => 'Let us collaborate.',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('project_invitations', [
            'project_id' => $this->project->id,
            'invited_user_id' => $recipient->id,
        ]);
    }

    public function test_creator_cannot_create_duplicate_active_project_invitation(): void
    {
        $recipient = User::factory()->create();
        $recipient->techs()->attach($this->react->id);
        ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $recipient->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->owner)->post(route('project-invitations.store', $this->project), [
            'invited_user_id' => $recipient->id,
            'message' => 'Second invite',
        ]);

        $response->assertSessionHasErrors('invited_user_id');
        $this->assertSame(1, ProjectInvitation::where('project_id', $this->project->id)->count());
    }

    public function test_creator_rejects_ineligible_project_invitation_targets(): void
    {
        $recipient = User::factory()->create();
        $recipient->techs()->attach(Tech::factory()->create());

        $response = $this->actingAs($this->owner)->post(route('project-invitations.store', $this->project), [
            'invited_user_id' => $recipient->id,
            'message' => 'Join us',
        ]);

        $response->assertSessionHasErrors('invited_user_id');
        $this->assertDatabaseMissing('project_invitations', [
            'project_id' => $this->project->id,
            'invited_user_id' => $recipient->id,
        ]);
    }

    public function test_creator_can_cancel_a_pending_project_invitation(): void
    {
        $recipient = User::factory()->create();
        $invitation = ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $recipient->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->owner)->delete(route('project-invitations.destroy', $invitation));

        $response->assertRedirect(route('projects.collaborators', $this->project));
        $response->assertSessionHas('success');

        $invitation->refresh();

        self::assertSame(ProjectInvitation::STATUS_CANCELLED, $invitation->status);
        self::assertNotNull($invitation->cancelled_at);
    }

    public function test_non_owner_cannot_cancel_a_project_invitation(): void
    {
        $recipient = User::factory()->create();
        $invitation = ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $recipient->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs(User::factory()->create())->delete(route('project-invitations.destroy', $invitation));

        $response->assertForbidden();
        $invitation->refresh();

        self::assertSame(ProjectInvitation::STATUS_PENDING, $invitation->status);
    }
}
