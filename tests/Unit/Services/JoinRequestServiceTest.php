<?php

namespace Tests\Unit\Services;

use App\Models\JoinRequest;
use App\Models\ProjectInvitation;
use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use App\Services\JoinRequestService;
use App\Services\Exceptions\AlreadyParticipantException;
use App\Services\Exceptions\DuplicateJoinRequestException;
use App\Services\Exceptions\ProjectNotAcceptingRequestsException;
use App\Services\Exceptions\SelfJoinException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JoinRequestServiceTest extends TestCase
{
    use RefreshDatabase;

    private JoinRequestService $service;
    private User $user;
    private User $projectOwner;
    private Project $project;
    private array $techIds;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new JoinRequestService();

        $this->projectOwner = User::factory()->create();
        $this->user = User::factory()->create();

        $techs = Tech::factory()->count(2)->create();
        $this->techIds = $techs->pluck('id')->toArray();

$this->project = Project::factory()->create([
            'user_id' => $this->projectOwner->id,
            'status' => 'open',
        ]);
        $this->project->techs()->attach($this->techIds);
    }

    // === validateCanCreate tests ===

    /** @test */
    public function validate_can_create_throws_on_duplicate_request(): void
    {
        // Create existing pending request
        JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->expectException(DuplicateJoinRequestException::class);

        $this->service->validateCanCreate($this->project, $this->user);
    }

    /** @test */
    public function validate_can_create_throws_on_self_join(): void
    {
        $this->expectException(SelfJoinException::class);

        $this->service->validateCanCreate($this->project, $this->projectOwner);
    }

    /** @test */
    public function validate_can_create_passes_for_new_request(): void
    {
        // Should not throw
        $this->service->validateCanCreate($this->project, $this->user);

        $this->assertTrue(true);
    }

    /** @test */
    public function validate_can_create_passes_when_project_is_in_progress(): void
    {
        $this->project->update(['status' => 'in_progress']);
        $this->project->refresh();

        // Should not throw
        $this->service->validateCanCreate($this->project, $this->user);

        $this->assertTrue(true);
    }

    /** @test */
    public function validate_can_create_passes_when_a_rejected_invitation_exists(): void
    {
        ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $this->user->id,
            'message' => 'Join us before the invite was rejected.',
            'status' => ProjectInvitation::STATUS_REJECTED,
            'responded_at' => now(),
        ]);

        $this->service->validateCanCreate($this->project, $this->user);

        $this->assertTrue(true);
    }

    /** @test */
    public function validate_can_create_throws_when_project_is_completed(): void
    {
        $this->project->update(['status' => 'completed']);
        $this->project->refresh();

        $this->expectException(ProjectNotAcceptingRequestsException::class);

        $this->service->validateCanCreate($this->project, $this->user);
    }

    /** @test */
    public function validate_can_create_throws_when_project_is_closed(): void
    {
        $this->project->update(['status' => 'closed']);
        $this->project->refresh();

        $this->expectException(ProjectNotAcceptingRequestsException::class);

        $this->service->validateCanCreate($this->project, $this->user);
    }

    /** @test */
    public function validate_can_create_throws_when_user_is_already_a_participant(): void
    {
        // Attach the user as a participant, bypassing the form.
        $this->project->participants()->attach($this->user->id);

        $this->expectException(AlreadyParticipantException::class);

        $this->service->validateCanCreate($this->project, $this->user);
    }

    // === create tests ===

    /** @test */
    public function create_produces_pending_join_request(): void
    {
        $message = 'I would like to join this amazing project!';

        $joinRequest = $this->service->create($this->project, $this->user, $message);

        $this->assertEquals('pending', $joinRequest->status);
        $this->assertEquals($this->project->id, $joinRequest->project_id);
        $this->assertEquals($this->user->id, $joinRequest->user_id);
        $this->assertEquals($message, $joinRequest->message);
    }

    /** @test */
    public function create_saves_message_content(): void
    {
        $message = 'This is my detailed message explaining why I want to join.';

        $joinRequest = $this->service->create($this->project, $this->user, $message);

        $this->assertDatabaseHas('join_requests', [
            'id' => $joinRequest->id,
            'message' => $message,
            'status' => 'pending',
        ]);
    }

    // === approve tests ===

    /** @test */
    public function approve_sets_status_to_approved_and_attaches_participant(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->service->approve($joinRequest);

        $joinRequest->refresh();
        $this->assertEquals('approved', $joinRequest->status);
        $this->assertNotNull($joinRequest->reviewed_at);

        $this->assertTrue(
            $this->project->participants()->where('user_id', $this->user->id)->exists()
        );
    }

    /** @test */
    public function approve_does_not_duplicate_participant(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        // Call approve twice
        $this->service->approve($joinRequest);
        $this->service->approve($joinRequest);

        $this->assertEquals(
            1,
            $this->project->participants()->where('user_id', $this->user->id)->count()
        );
    }

    /** @test */
    public function user_can_create_new_request_after_rejection(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);

        $this->service->validateCanCreate($this->project, $this->user);

        $newRequest = $this->service->create($this->project, $this->user, 'Reapplying after rejection');

        $this->assertDatabaseHas('join_requests', [
            'id' => $newRequest->id,
            'status' => 'pending',
        ]);
        $this->assertNotEquals($joinRequest->id, $newRequest->id);
    }

    /** @test */
    public function user_can_create_new_request_after_cancel(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->service->cancel($joinRequest);

        $this->service->validateCanCreate($this->project, $this->user);

        $newRequest = $this->service->create($this->project, $this->user, 'New request after cancel');

        $this->assertDatabaseHas('join_requests', [
            'id' => $newRequest->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function create_throws_on_db_level_duplicate(): void
    {
        JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->expectException(\App\Services\Exceptions\DuplicateJoinRequestException::class);

        $this->service->create($this->project, $this->user, 'This should fail');
    }

    // === reject tests ===

    /** @test */
    public function reject_sets_status_to_rejected(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->service->reject($joinRequest);

        $joinRequest->refresh();
        $this->assertEquals('rejected', $joinRequest->status);
        $this->assertNotNull($joinRequest->reviewed_at);
    }

    /** @test */
    public function reject_does_not_attach_participant(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->service->reject($joinRequest);

        $this->assertFalse(
            $this->project->participants()->where('user_id', $this->user->id)->exists()
        );
    }

    // === cancel tests ===

    /** @test */
    public function cancel_deletes_join_request(): void
    {
        $joinRequest = JoinRequest::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $joinRequestId = $joinRequest->id;

        $this->service->cancel($joinRequest);

        $this->assertDatabaseMissing('join_requests', ['id' => $joinRequestId]);
    }
}
