<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_join_request_creates_notification_for_project_creator(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme al proyecto',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $creator->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_join_request_approved_creates_notification_for_applicant(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($creator)
            ->post(route('join-requests.approve', $joinRequest));

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $applicant->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_join_request_rejected_creates_notification_for_applicant(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($creator)
            ->post(route('join-requests.reject', $joinRequest));

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $applicant->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_notification_data_has_correct_structure(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Test Project Alpha',
            'status' => 'open',
        ]);

        $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero participar',
            ]);

        $notification = $creator->notifications()->first();

        $this->assertNotNull($notification);

        $data = $notification->data;

        $this->assertEquals('join_request_received', $data['type']);
        $this->assertEquals($project->slug, $data['project_slug']);
        $this->assertEquals('Test Project Alpha', $data['project_title']);
        $this->assertEquals($applicant->id, $data['applicant_id']);
        $this->assertEquals($applicant->name, $data['applicant_name']);
    }
}
