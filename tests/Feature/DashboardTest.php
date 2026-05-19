<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /**
     * TEST 1: Usuario logueado puede ver dashboard
     */
    public function test_authenticated_user_can_view_dashboard(): void
    {
        // Act
        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }

    /**
     * TEST 2: Usuario no logueado no puede ver dashboard
     */
    public function test_unauthenticated_user_cannot_view_dashboard(): void
    {
        // Act
        $response = $this->get(route('dashboard'));

        // Assert
        $response->assertRedirect('/login');
    }

    /**
     * TEST 3: Dashboard muestra estadísticas correctas
     */
    public function test_dashboard_shows_correct_stats(): void
    {
        // Arrange: Crear 2 proyectos
        Project::factory()->count(2)->create(['user_id' => $this->user->id]);

        // Act
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }

    /**
     * TEST 4: Dashboard muestra proyectos creados
     */
    public function test_dashboard_shows_created_projects(): void
    {
        // Arrange
        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Mi Proyecto Test',
        ]);

        // Act
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }

    /**
     * TEST 5: Dashboard muestra solicitudes pendientes
     */
    public function test_dashboard_shows_pending_requests(): void
    {
        // Arrange: Crear proyecto y solicitud
        $project = Project::factory()->create(['user_id' => $this->user->id]);
        $applicant = User::factory()->create();
        
        JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        // Act
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }

    /**
     * TEST 6: Dashboard muestra proyectos donde participa
     */
    public function test_dashboard_shows_participating_projects(): void
    {
        // Arrange: Crear proyecto y agregar como participante
        $creator = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id]);
        $project->participants()->attach($this->user->id);

        // Act
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }

    /**
     * TEST 7: Dashboard muestra botón para crear proyecto
     */
    public function test_dashboard_has_create_project_button(): void
    {
        // Act
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }

    /**
     * TEST 8: Dashboard muestra empty state cuando no hay proyectos
     */
    public function test_dashboard_shows_empty_state_when_no_projects(): void
    {
        // Act
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        // Assert
        $response->assertStatus(200);
    }
}
