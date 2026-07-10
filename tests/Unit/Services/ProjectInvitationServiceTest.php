<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\Tech;
use App\Models\User;
use App\Notifications\ProjectInvitationReceived;
use App\Services\CollaboratorSuggestionService;
use App\Services\ProjectInvitationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;
use PDOException;
use Tests\TestCase;

final class ProjectInvitationServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProjectInvitationService $service;
    private Project $project;
    private User $owner;
    private User $invitedUser;
    private Tech $matchingTech;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ProjectInvitationService(new CollaboratorSuggestionService());

        $this->owner = User::factory()->create();
        $this->invitedUser = User::factory()->create();
        $this->matchingTech = Tech::factory()->create();
        $this->project = Project::factory()->create(['user_id' => $this->owner->id]);

        $this->project->techs()->attach($this->matchingTech->id);
        $this->invitedUser->techs()->attach($this->matchingTech->id);
    }

    public function test_create_creates_pending_invitation_and_notifies_recipient(): void
    {
        Notification::fake();

        $invitation = $this->service->create($this->project, $this->invitedUser->id, 'Welcome aboard');

        self::assertSame(ProjectInvitation::STATUS_PENDING, $invitation->status);
        self::assertSame($this->project->id, $invitation->project_id);
        self::assertSame($this->invitedUser->id, $invitation->invited_user_id);
        Notification::assertSentTo($this->invitedUser, ProjectInvitationReceived::class);
    }

    public function test_create_rejects_duplicate_active_invitation(): void
    {
        ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $this->invitedUser->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $this->expectException(ValidationException::class);

        $this->service->create($this->project, $this->invitedUser->id, 'Still interested');
    }

    public function test_create_rejects_users_outside_the_suggestion_set(): void
    {
        $ineligibleUser = User::factory()->create();
        $ineligibleUser->techs()->attach(Tech::factory()->create());

        $this->expectException(ValidationException::class);

        $this->service->create($this->project, $ineligibleUser->id, 'Join us');
    }

    public function test_create_translates_unique_constraint_violation_into_validation_error(): void
    {
        $service = new class(new CollaboratorSuggestionService()) extends ProjectInvitationService {
            protected function persistInvitation(Project $project, int $invitedUserId, ?string $message = null): ProjectInvitation
            {
                throw new UniqueConstraintViolationException(
                    'testing',
                    'insert into project_invitations (...) values (...)',
                    [],
                    new PDOException('Duplicate entry')
                );
            }
        };

        $this->expectException(ValidationException::class);

        $service->create($this->project, $this->invitedUser->id, 'Race condition');
    }

    public function test_cancel_marks_the_invitation_as_cancelled(): void
    {
        $invitation = ProjectInvitation::create([
            'project_id' => $this->project->id,
            'invited_user_id' => $this->invitedUser->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $cancelled = $this->service->cancel($invitation);

        self::assertSame(ProjectInvitation::STATUS_CANCELLED, $cancelled->status);
        self::assertNotNull($cancelled->cancelled_at);
    }
}
