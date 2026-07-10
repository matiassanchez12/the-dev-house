<?php

declare(strict_types=1);

namespace Tests\Unit\Helpers;

use App\Helpers\ApiResourceTransformer;
use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectInvitationTransformerTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_invitation_is_transformed_with_safe_nested_models(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        $data = ApiResourceTransformer::projectInvitation($invitation->load(['project.creator', 'invitedUser']));

        self::assertSame($invitation->id, $data['id']);
        self::assertSame($project->title, $data['project']['title']);
        self::assertArrayNotHasKey('email', $data['project']['creator']);
        self::assertSame($invitedUser->name, $data['invited_user']['name']);
        self::assertArrayNotHasKey('email', $data['invited_user']);
    }

    public function test_collaborator_suggestion_is_transformed_with_safe_nested_models(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $invitedUser = User::factory()->create();
        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $invitedUser->id,
            'message' => 'Join us on this project.',
            'status' => 'pending',
        ]);

        $data = ApiResourceTransformer::collaboratorSuggestion([
            'user' => $invitedUser->load('techs'),
            'matching_techs' => [],
            'pending_invitation' => $invitation->load(['project.creator', 'invitedUser']),
        ]);

        self::assertSame($invitedUser->name, $data['user']['name']);
        self::assertSame($invitation->id, $data['pending_invitation']['id']);
        self::assertArrayHasKey('matching_techs', $data);
    }

    public function test_join_request_is_transformed_with_safe_nested_models(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $applicant = User::factory()->create();

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'I would like to contribute.',
            'status' => 'pending',
        ]);

        $data = ApiResourceTransformer::joinRequests(collect([
            $joinRequest->load(['project.creator', 'applicant']),
        ]));
        $data = $data[0];

        self::assertSame($joinRequest->id, $data['id']);
        self::assertSame($project->title, $data['project']['title']);
        self::assertArrayNotHasKey('email', $data['project']['creator']);
        self::assertSame($applicant->name, $data['applicant']['name']);
        self::assertArrayNotHasKey('email', $data['applicant']);
    }
}
