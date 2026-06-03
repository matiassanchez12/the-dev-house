<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JoinRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $applicant;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear creator del proyecto
        $this->creator = User::factory()->create();
        
        // Crear usuario que quiere unirse
        $this->applicant = User::factory()->create();
        
        // Crear proyecto
        $this->project = Project::factory()->create([
            'user_id' => $this->creator->id,
            'status' => 'open',
        ]);
    }

    /**
     * TEST 1: Usuario logueado puede enviar solicitud
     */
    public function test_authenticated_user_can_send_join_request(): void
    {
        // Arrange
        $requestData = [
            'message' => 'Hola, me interesa este proyecto porque tengo experiencia en React.',
        ];

        // Act
        $response = $this->actingAs($this->applicant)
            ->post(route('join-requests.store', $this->project), $requestData);

        // Assert
        $response->assertRedirect(route('projects.show', $this->project));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('join_requests', [
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'status' => 'pending',
        ]);
    }

    /**
     * TEST 2: Usuario no logueado no puede enviar solicitud
     */
    public function test_unauthenticated_user_cannot_send_join_request(): void
    {
        // Act
        $response = $this->post(route('join-requests.store', $this->project), [
            'message' => 'Quiero unirme',
        ]);

        // Assert
        $response->assertRedirect('/login');
    }

    /**
     * TEST 3: Creator no puede unirse a su propio proyecto
     */
    public function test_creator_cannot_join_own_project(): void
    {
        // Act
        $response = $this->actingAs($this->creator)
            ->post(route('join-requests.store', $this->project), [
                'message' => 'Quiero unirme',
            ]);

        // Assert
        $response->assertSessionHasErrors('message');
        $this->assertDatabaseMissing('join_requests', [
            'project_id' => $this->project->id,
            'user_id' => $this->creator->id,
        ]);
    }

    /**
     * TEST 4: No se puede enviar más de una solicitud por proyecto
     */
    public function test_cannot_send_duplicate_join_request(): void
    {
        // Arrange: Crear primera solicitud
        JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Primera solicitud',
            'status' => 'pending',
        ]);

        // Act: Intentar enviar segunda solicitud
        $response = $this->actingAs($this->applicant)
            ->post(route('join-requests.store', $this->project), [
                'message' => 'Segunda solicitud',
            ]);

        // Assert
        $response->assertSessionHasErrors('message');
        $this->assertEquals(1, JoinRequest::where('project_id', $this->project->id)->count());
    }

    /**
     * TEST 5: Creator puede aprobar solicitud
     */
    public function test_creator_can_approve_join_request(): void
    {
        // Arrange: Crear solicitud pendiente
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        // Act: Aprobar solicitud
        $response = $this->actingAs($this->creator)
            ->post(route('join-requests.approve', $joinRequest));

        // Assert
        $response->assertRedirect();
        $joinRequest->refresh();
        $this->assertEquals('approved', $joinRequest->status);
        $this->assertNotNull($joinRequest->reviewed_at);
        
        // Verificar que el usuario fue agregado como participante
        $this->assertDatabaseHas('project_participants', [
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
        ]);
    }

    /**
     * TEST 6: No creator no puede aprobar solicitud
     */
    public function test_non_creator_cannot_approve_join_request(): void
    {
        // Arrange
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        // Act: Otro usuario intenta aprobar
        $otherUser = User::factory()->create();
        $response = $this->actingAs($otherUser)
            ->post(route('join-requests.approve', $joinRequest));

        // Assert
        $response->assertStatus(403);
    }

    /**
     * TEST 7: Creator puede rechazar solicitud
     */
    public function test_creator_can_reject_join_request(): void
    {
        // Arrange
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        // Act: Rechazar solicitud
        $response = $this->actingAs($this->creator)
            ->post(route('join-requests.reject', $joinRequest));

        // Assert
        $response->assertRedirect();
        $joinRequest->refresh();
        $this->assertEquals('rejected', $joinRequest->status);
        $this->assertNotNull($joinRequest->reviewed_at);
        
        // Verificar que NO fue agregado como participante
        $this->assertDatabaseMissing('project_participants', [
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
        ]);
    }

    /**
     * TEST 8: Applicant puede cancelar solicitud pendiente
     */
    public function test_applicant_can_cancel_pending_request(): void
    {
        // Arrange
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        // Act: Cancelar solicitud
        $response = $this->actingAs($this->applicant)
            ->post(route('join-requests.cancel', $joinRequest));

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseMissing('join_requests', ['id' => $joinRequest->id]);
    }

    /**
     * TEST 9: No se puede cancelar solicitud ya revisada
     */
    public function test_cannot_cancel_already_reviewed_request(): void
    {
        // Arrange
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        // Act
        $response = $this->actingAs($this->applicant)
            ->post(route('join-requests.cancel', $joinRequest));

        // Assert
        $response->assertSessionHasErrors('message');
        $this->assertDatabaseHas('join_requests', ['id' => $joinRequest->id]);
    }

    /**
     * TEST 10: Usuario puede ver sus solicitudes enviadas y recibidas
     */
    public function test_user_can_view_join_requests_index(): void
    {
        // Arrange: Crear solicitudes
        JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Solicitud 1',
            'status' => 'pending',
        ]);

        // Act: Ver página de solicitudes
        $response = $this->actingAs($this->applicant)
            ->get(route('join-requests.index'));

        // Assert: Debería cargar la página correctamente (200)
        $response->assertStatus(200);
    }

    /**
     * TEST 11: Usuario puede re-aplicar después de ser rechazado
     *
     * Atomicity: the unique constraint must only apply to pending requests,
     * not across all statuses.
     */
    public function test_user_can_reapply_after_rejection(): void
    {
        // Arrange: Crear solicitud y rechazarla
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Primera solicitud',
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);

        $requestData = [
            'message' => 'Segunda oportunidad, ahora con más experiencia.',
        ];

        // Act: Intentar enviar nueva solicitud
        $response = $this->actingAs($this->applicant)
            ->post(route('join-requests.store', $this->project), $requestData);

        // Assert
        $response->assertRedirect(route('projects.show', $this->project));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('join_requests', [
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Segunda oportunidad, ahora con más experiencia.',
            'status' => 'pending',
        ]);
    }

    /**
     * TEST 12: Aprobar una solicitud ya aprobada no duplica participantes
     *
     * Atomicity: approve must handle the edge case where the user is already
     * a participant (resilience, not race).
     */
    public function test_approve_already_approved_request_is_safe(): void
    {
        // Arrange: Crear solicitud aprobada
        $joinRequest = JoinRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        // Manually attach participant (simulating first approve)
        $this->project->participants()->attach($this->applicant->id);

        // Act: Intentar aprobar de nuevo (desde el controller da error, pero el service debe ser seguro)
        $this->app->make(\App\Services\JoinRequestService::class)->approve($joinRequest);

        // Assert: No se duplica el participante
        $this->assertEquals(
            1,
            $this->project->participants()->where('user_id', $this->applicant->id)->count()
        );
    }
}
