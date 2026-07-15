<?php

namespace Tests\Unit\Services;

use App\Models\Phase;
use App\Models\Project;
use App\Models\User;
use App\Services\PhaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseServiceTest extends TestCase
{
    use RefreshDatabase;

    private PhaseService $service;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new PhaseService();
        $this->project = Project::factory()->create(['user_id' => User::factory()->create()->id]);
    }

    public function test_create_stores_phase_for_project(): void
    {
        $phase = $this->service->create($this->project, [
            'title' => 'First milestone',
            'description' => 'Shipped the MVP',
        ]);

        $this->assertInstanceOf(Phase::class, $phase);
        $this->assertSame($this->project->id, $phase->project_id);
        $this->assertSame('First milestone', $phase->title);
    }

    public function test_list_for_returns_phases_newest_first(): void
    {
        $older = Phase::factory()->create(['project_id' => $this->project->id]);
        sleep(1);
        $newer = Phase::factory()->create(['project_id' => $this->project->id]);

        $phases = $this->service->listFor($this->project);

        $this->assertSame([$newer->id, $older->id], $phases->pluck('id')->all());
    }

    public function test_update_changes_phase_fields(): void
    {
        $phase = Phase::factory()->create(['project_id' => $this->project->id, 'title' => 'Old title']);

        $updated = $this->service->update($phase, [
            'title' => 'New title',
            'description' => 'Updated description',
        ]);

        $this->assertSame('New title', $updated->title);
        $this->assertSame('Updated description', $updated->description);
    }

    public function test_delete_removes_phase(): void
    {
        $phase = Phase::factory()->create(['project_id' => $this->project->id]);

        $this->service->delete($phase);

        $this->assertDatabaseMissing('phases', ['id' => $phase->id]);
    }
}
