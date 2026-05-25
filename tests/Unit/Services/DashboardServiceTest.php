<?php

namespace Tests\Unit\Services;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    private DashboardService $service;
    private User $user;
    private array $techIds;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new DashboardService();
        $this->user = User::factory()->create();

        $techs = Tech::factory()->count(2)->create();
        $this->techIds = $techs->pluck('id')->toArray();
    }

    /** @test */
    public function get_dashboard_data_returns_all_required_keys(): void
    {
        $data = $this->service->getDashboardData($this->user);

        $this->assertArrayHasKey('stats', $data);
        $this->assertArrayHasKey('createdProjects', $data);
        $this->assertArrayHasKey('participatingProjects', $data);
        $this->assertArrayHasKey('pendingRequests', $data);
        $this->assertArrayHasKey('sentRequests', $data);
    }

    /** @test */
    public function get_dashboard_data_returns_correct_stats(): void
    {
        // Create projects for this user
        Project::factory()->count(2)->create(['user_id' => $this->user->id]);

        // Create another user and project for participating
        $otherUser = User::factory()->create();
        $participatingProject = Project::factory()->create(['user_id' => $otherUser->id]);
        $participatingProject->participants()->attach($this->user->id);

        // Create pending received request (on a project owned by this user)
        $applicant = User::factory()->create();
        JoinRequest::factory()->create([
            'project_id' => Project::factory()->create(['user_id' => $this->user->id])->id,
            'user_id' => $applicant->id,
            'status' => 'pending',
        ]);

        // Create approved sent request
        JoinRequest::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => Project::factory()->create()->id,
            'status' => 'approved',
        ]);

        $data = $this->service->getDashboardData($this->user);

        $this->assertEquals(3, $data['stats']['projects_created']);
        $this->assertEquals(1, $data['stats']['projects_joined']);
        $this->assertEquals(1, $data['stats']['pending_requests_received']);
        $this->assertEquals(1, $data['stats']['requests_approved']);
    }

    /** @test */
    public function get_dashboard_data_returns_created_projects_collection(): void
    {
        Project::factory()->count(3)->create(['user_id' => $this->user->id]);

        $data = $this->service->getDashboardData($this->user);

        $this->assertCount(3, $data['createdProjects']);
    }

    /** @test */
    public function get_dashboard_data_returns_participating_projects_collection(): void
    {
        $otherUser = User::factory()->create();

        $project1 = Project::factory()->create(['user_id' => $otherUser->id]);
        $project2 = Project::factory()->create(['user_id' => $otherUser->id]);

        $project1->participants()->attach($this->user->id);
        $project2->participants()->attach($this->user->id);

        $data = $this->service->getDashboardData($this->user);

        $this->assertCount(2, $data['participatingProjects']);
    }

    /** @test */
    public function get_dashboard_data_returns_pending_requests_received(): void
    {
        // Create project owned by user with pending request
        $project = Project::factory()->create(['user_id' => $this->user->id]);
        $otherUser = User::factory()->create();

        JoinRequest::factory()->count(2)->create([
            'project_id' => $project->id,
            'status' => 'pending',
        ]);

        $data = $this->service->getDashboardData($this->user);

        $this->assertCount(2, $data['pendingRequests']);
    }

    /** @test */
    public function get_dashboard_data_returns_sent_pending_requests(): void
    {
        // Create 3 different projects where this user has sent requests
        $project1 = Project::factory()->create();
        $project2 = Project::factory()->create();
        $project3 = Project::factory()->create();

        JoinRequest::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project1->id,
            'status' => 'pending',
        ]);
        JoinRequest::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project2->id,
            'status' => 'pending',
        ]);
        JoinRequest::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project3->id,
            'status' => 'pending',
        ]);

        $data = $this->service->getDashboardData($this->user);

        $this->assertCount(3, $data['sentRequests']);
    }
}