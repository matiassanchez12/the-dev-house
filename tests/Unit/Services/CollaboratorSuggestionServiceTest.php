<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\Tech;
use App\Models\User;
use App\Services\CollaboratorSuggestionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CollaboratorSuggestionServiceTest extends TestCase
{
    use RefreshDatabase;

    private CollaboratorSuggestionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new CollaboratorSuggestionService();
    }

    public function test_for_project_returns_users_with_overlapping_techs(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $react = Tech::factory()->create(['slug' => 'react', 'name' => 'React']);
        $laravel = Tech::factory()->create(['slug' => 'laravel', 'name' => 'Laravel']);
        $project->techs()->attach([$react->id, $laravel->id]);

        $suggestedUser = User::factory()->create(['name' => 'Maya']);
        $suggestedUser->techs()->attach([$react->id]);

        $otherUser = User::factory()->create(['name' => 'Zoe']);
        $otherUser->techs()->attach([Tech::factory()->create()->id]);

        $suggestions = $this->service->forProject($project);

        self::assertCount(1, $suggestions);
        self::assertSame($suggestedUser->id, $suggestions->first()['user']->id);
        self::assertSame(['React'], collect($suggestions->first()['matching_techs'])->pluck('name')->all());
    }

    public function test_for_project_excludes_creator_participants_and_pending_invites(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $react = Tech::factory()->create(['slug' => 'react', 'name' => 'React']);
        $project->techs()->attach($react->id);

        $owner->techs()->attach($react->id);

        $participant = User::factory()->create(['name' => 'Participant']);
        $participant->techs()->attach($react->id);
        $project->participants()->attach($participant->id);

        $pendingInvitee = User::factory()->create(['name' => 'Pending Invitee']);
        $pendingInvitee->techs()->attach($react->id);
        ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $pendingInvitee->id,
            'message' => 'Join us',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $eligibleUser = User::factory()->create(['name' => 'Eligible']);
        $eligibleUser->techs()->attach($react->id);

        $project->loadMissing('participants');
        $suggestions = $this->service->forProject($project);

        self::assertSame([$eligibleUser->id], $suggestions->pluck('user.id')->all());
    }

    public function test_is_eligible_for_project_rejects_users_without_overlapping_techs(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $react = Tech::factory()->create(['slug' => 'react', 'name' => 'React']);
        $project->techs()->attach($react->id);

        $eligibleUser = User::factory()->create();
        $eligibleUser->techs()->attach($react->id);

        $ineligibleUser = User::factory()->create();
        $ineligibleUser->techs()->attach(Tech::factory()->create()->id);

        self::assertTrue($this->service->isEligibleForProject($project, $eligibleUser->id));
        self::assertFalse($this->service->isEligibleForProject($project, $ineligibleUser->id));
    }
}
