<?php

namespace Tests\Unit\Broadcasting;

use App\Broadcasting\ProjectChannel;
use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectChannelTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_can_join_project_chat_channel(): void
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);

        $this->assertEquals(['creator' => true], (new ProjectChannel())->join($creator, $project->id));
    }

    public function test_participant_can_join_project_chat_channel(): void
    {
        $creator = User::factory()->create();
        $participant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $project->participants()->attach($participant->id, ['role' => 'developer', 'joined_at' => now()]);

        $this->assertEquals(['participant' => true], (new ProjectChannel())->join($participant, $project->id));
    }

    public function test_pending_applicant_cannot_join_project_chat_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);

        JoinRequest::factory()->pending()->create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
        ]);

        $this->assertFalse((new ProjectChannel())->join($applicant, $project->id));
    }
}
