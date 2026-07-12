<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\JoinRequest;
use App\Models\ProjectInvitation;
use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private array $techIds;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuario de prueba
        $this->user = User::factory()->create();
        
        // Crear techs de prueba
        $techs = Tech::factory()->count(3)->create();
        $this->techIds = $techs->pluck('id')->toArray();
    }

    /**
     * TEST 1: Listar proyectos (público)
     */
    public function test_can_view_projects_list(): void
    {
        // Arrange: Crear algunos proyectos
        Project::factory()->count(5)->create();

        // Act: Ir a la página de proyectos
        $response = $this->get('/projects');

        // Assert: Debería ver la lista
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/index')
                ->has('projects.data', 5)
                ->has('techs')
        );
    }

    /**
     * TEST 2: Filtrar proyectos por tecnología
     */
    public function test_can_filter_projects_by_tech(): void
    {
        // Arrange
        $tech1 = Tech::factory()->create(['slug' => 'react']);
        $tech2 = Tech::factory()->create(['slug' => 'vue']);
        
        $projectWithReact = Project::factory()->create();
        $projectWithReact->techs()->attach($tech1->id);
        
        $projectWithVue = Project::factory()->create();
        $projectWithVue->techs()->attach($tech2->id);

        // Act
        $response = $this->get('/projects?tech=react');

        // Assert
        $response->assertStatus(200);
        
        // Verificar que hay 1 proyecto en la respuesta
        $content = $response->getContent();
        $this->assertStringContainsString($projectWithReact->title, $content);
    }

    /**
     * TEST 3: Filtrar proyectos por estado
     */
    public function test_can_filter_projects_by_status(): void
    {
        // Arrange
        Project::factory()->create(['status' => 'open']);
        Project::factory()->create(['status' => 'closed']);
        Project::factory()->create(['status' => 'completed']);

        // Act
        $response = $this->get('/projects?status=open');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('projects.data', 1)
                ->where('filters.status', 'open')
        );
    }

    /**
     * TEST 3b: Filtrar proyectos por search (title)
     */
    public function test_can_filter_projects_by_search(): void
    {
        // Arrange
        Project::factory()->create(['title' => 'React Dashboard']);
        Project::factory()->create(['title' => 'Vue Admin Panel']);
        Project::factory()->create(['title' => 'Laravel API']);

        // Act
        $response = $this->get('/projects?search=react');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('projects.data', 1)
                ->where('projects.data.0.title', 'React Dashboard')
                ->where('filters.search', 'react')
        );
    }

    /**
     * TEST 3c: Search es case-insensitive y matchea substring
     */
    public function test_search_is_case_insensitive_and_matches_substring(): void
    {
        // Arrange
        Project::factory()->create(['title' => 'My Awesome Project']);
        Project::factory()->create(['title' => 'Another Thing']);

        // Act
        $response = $this->get('/projects?search=AWESOME');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page->has('projects.data', 1)
        );
    }

    public function test_can_view_create_project_form_when_authenticated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/projects/create');

        $response->assertStatus(200);
    }

    public function test_cannot_view_create_form_without_authentication(): void
    {
        $response = $this->get('/projects/create');

        $response->assertStatus(302);
    }

    /**
     * TEST 6: Crear proyecto exitosamente
     */
    public function test_can_create_project(): void
    {
        // Arrange
        Storage::fake('public');
        
        $projectData = [
            'title' => 'Mi Proyecto Increíble',
            'description' => 'Este es un proyecto de prueba',
            'vision' => 'Quiero cambiar el mundo',
            'techs' => $this->techIds,
            'repository_url' => 'https://github.com/test/project',
            'demo_url' => 'https://mi-proyecto.com',
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->post('/projects', $projectData);

        // Assert
        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        // Verificar en la DB
        $this->assertDatabaseHas('projects', [
            'title' => 'Mi Proyecto Increíble',
        ]);
        
        // Verificar relación con techs
        $project = Project::where('title', 'Mi Proyecto Increíble')->first();
        $this->assertNotNull($project);
        $this->assertEquals(3, $project->techs()->count());
    }

    /**
     * TEST 7: Crear proyecto con imágenes
     */
    public function test_can_create_project_with_images(): void
    {
        // Arrange
        Storage::fake('public');
        
        $image = UploadedFile::fake()->create('project.jpg', 100, 'image/jpeg');
        
        $projectData = [
            'title' => 'Proyecto con Imágenes',
            'description' => 'Con fotos',
            'techs' => $this->techIds,
            'images' => [$image],
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->post('/projects', $projectData);

        // Assert
        $response->assertRedirect();
        
        // Verificar en DB
        $project = Project::where('title', 'Proyecto con Imágenes')->first();
        $this->assertNotNull($project);
        $this->assertCount(1, $project->images);
    }

    /**
     * TEST 8: Validación - título requerido
     */
    public function test_title_is_required_when_creating_project(): void
    {
        // Arrange
        $projectData = [
            'description' => 'Sin título',
            'techs' => $this->techIds,
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->post('/projects', $projectData);

        // Assert
        $response->assertSessionHasErrors('title');
        $this->assertDatabaseCount('projects', 0);
    }

    /**
     * TEST 9: Validación - techs requeridos
     */
    public function test_techs_are_required_when_creating_project(): void
    {
        // Arrange
        $projectData = [
            'title' => 'Sin techs',
            'description' => 'Descripción',
            'techs' => [],
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->post('/projects', $projectData);

        // Assert
        $response->assertSessionHasErrors('techs');
    }

    /**
     * TEST 10: Ver detalle de proyecto (público)
     */
    public function test_can_view_project_detail(): void
    {
        // Arrange
        $project = Project::factory()->create(['slug' => 'mi-proyecto']);
        $project->techs()->attach($this->techIds);

        // Act
        $response = $this->get('/projects/mi-proyecto');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/show')
                ->has('project')
        );
        
        $response->assertInertia(
            fn ($page) => $page
                ->where('project.id', $project->id)
                ->where('project.slug', 'mi-proyecto')
        );
    }

    public function test_project_detail_includes_viewer_pending_join_request(): void
    {
        $project = Project::factory()->create(['slug' => 'project-with-request']);
        $viewer = User::factory()->create();

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $viewer->id,
            'message' => 'I would like to contribute to this project.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($viewer)->get('/projects/project-with-request');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/show')
                ->where('project.viewerJoinRequest.status', 'pending')
                ->where('project.viewerJoinRequest.id', $joinRequest->id)
        );
    }

    public function test_project_detail_includes_viewer_rejected_join_request(): void
    {
        $project = Project::factory()->create(['slug' => 'project-rejected']);
        $viewer = User::factory()->create();

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $viewer->id,
            'message' => 'I would like to contribute.',
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);

        $response = $this->actingAs($viewer)->get('/projects/project-rejected');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/show')
                ->where('project.viewerJoinRequest.status', 'rejected')
                ->where('project.viewerJoinRequest.id', $joinRequest->id)
                ->where('project.viewerJoinRequest.message', 'I would like to contribute.')
        );
    }

    public function test_project_detail_includes_viewer_pending_invitation(): void
    {
        $project = Project::factory()->create(['slug' => 'project-with-invitation']);
        $creator = User::factory()->create();
        $viewer = User::factory()->create();

        $project->update(['user_id' => $creator->id]);

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'invited_user_id' => $viewer->id,
            'message' => 'We would like to collaborate with you.',
            'status' => ProjectInvitation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($viewer)->get('/projects/project-with-invitation');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/show')
                ->where('project.viewerPendingInvitation.id', $invitation->id)
                ->where('project.viewerPendingInvitation.status', 'pending')
                ->where('project.viewerPendingInvitation.message', 'We would like to collaborate with you.')
        );
    }

    /**
     * TEST 11: Ver formulario de edición (solo creator)
     */
    public function test_creator_can_view_edit_form(): void
    {
        // Arrange
        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'images' => ['projects/edit-image.jpg'],
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->get("/projects/{$project->slug}/edit");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/edit')
                ->where('project.id', $project->id)
                ->where('project.images.0.path', 'projects/edit-image.jpg')
                ->where('project.images.0.url', Storage::disk('public')->url('projects/edit-image.jpg'))
        );
    }

    /**
     * TEST 12: No creator no puede editar
     */
    public function test_non_creator_cannot_edit_project(): void
    {
        // Arrange
        $otherUser = User::factory()->create();
        $project = Project::factory()->create();

        // Act
        $response = $this->actingAs($otherUser)
            ->get("/projects/{$project->slug}/edit");

        // Assert
        $response->assertStatus(403);
    }

    /**
     * TEST 13: Actualizar proyecto exitosamente
     */
    public function test_can_update_project(): void
    {
        // Arrange
        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Título Original',
        ]);

        $updateData = [
            'title' => 'Título Actualizado',
            'description' => 'Nueva descripción',
            'techs' => $this->techIds,
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->put("/projects/{$project->slug}", $updateData);

        // Assert
        $response->assertRedirect();
        
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'title' => 'Título Actualizado',
        ]);
    }

    /**
     * TEST 14: Eliminar proyecto (solo creator)
     */
    public function test_creator_can_delete_project(): void
    {
        // Arrange
        $project = Project::factory()->create(['user_id' => $this->user->id]);

        // Act
        $response = $this->actingAs($this->user)
            ->delete("/projects/{$project->slug}");

        // Assert
        $response->assertRedirect('/projects');
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    /**
     * TEST 15: No creator no puede eliminar
     */
    public function test_non_creator_cannot_delete_project(): void
    {
        // Arrange
        $otherUser = User::factory()->create();
        $project = Project::factory()->create();

        // Act
        $response = $this->actingAs($otherUser)
            ->delete("/projects/{$project->slug}");

        // Assert
        $response->assertStatus(403);
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    /**
     * TEST 16: Slug único automático
     */
    public function test_slug_is_unique_when_creating_project(): void
    {
        // Arrange: Crear proyecto existente con mismo título manualmente
        $existingProject = new Project();
        $existingProject->user_id = $this->user->id;
        $existingProject->title = 'Mi Proyecto';
        $existingProject->slug = 'mi-proyecto';
        $existingProject->description = 'Proyecto existente';
        $existingProject->status = 'open';
        $existingProject->save();
        $existingProject->techs()->attach($this->techIds);

        $projectData = [
            'title' => 'Mi Proyecto Otro', // Different title to pass unique validation
            'description' => 'Otro proyecto',
            'techs' => $this->techIds,
        ];

        // Act: Create another project, then manually test slug generation
        $response = $this->actingAs($this->user)->post('/projects', $projectData);

        // Assert: Debería redirigir
        $response->assertRedirect();

        // Verify the slug was generated uniquely
        $newProject = Project::where('title', 'Mi Proyecto Otro')->first();
        $this->assertNotNull($newProject);
        $this->assertEquals('mi-proyecto-otro', $newProject->slug);

        // Now test duplicate slug handling directly via service
        $service = new \App\Services\ProjectService();
        $duplicateSlug = $service->generateUniqueSlug('Mi Proyecto');
        $this->assertEquals('mi-proyecto-1', $duplicateSlug);
    }

    /**
     * TEST 17: Update only deletes images that belong to the project (happy path)
     *
     * Security: remove_images must be intersected with $project->images.
     */
    public function test_update_only_deletes_images_owned_by_project(): void
    {
        // Arrange
        $disk = 'public';
        Storage::fake($disk);

        $ownedPath = 'projects/owned-image.jpg';
        Storage::disk($disk)->put($ownedPath, 'fake-bytes');

        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'images' => [$ownedPath],
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->put("/projects/{$project->slug}", [
                'title' => $project->title,
                'description' => $project->description,
                'techs' => $this->techIds,
                'remove_images' => [$ownedPath],
            ]);

        // Assert
        $response->assertRedirect();
        Storage::disk($disk)->assertMissing($ownedPath);
        $this->assertEquals([], $project->fresh()->images);
    }

    /**
     * TEST 18: Update ignores remove_image paths that do not belong to the project
     *
     * Security: a malicious user must not be able to delete another project's image.
     */
    public function test_update_ignores_remove_image_paths_not_in_project(): void
    {
        // Arrange
        $disk = 'public';
        Storage::fake($disk);

        $ownedPath = 'projects/owned.jpg';
        $otherProjectPath = 'projects/other-project.jpg';
        Storage::disk($disk)->put($ownedPath, 'fake-bytes');
        Storage::disk($disk)->put($otherProjectPath, 'fake-bytes');

        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'images' => [$ownedPath],
        ]);

        // Act — send a path the project does NOT own
        $response = $this->actingAs($this->user)
            ->put("/projects/{$project->slug}", [
                'title' => $project->title,
                'description' => $project->description,
                'techs' => $this->techIds,
                'remove_images' => [$otherProjectPath],
            ]);

        // Assert
        $response->assertRedirect();
        Storage::disk($disk)->assertExists($otherProjectPath);
        Storage::disk($disk)->assertExists($ownedPath);
        $this->assertEquals([$ownedPath], $project->fresh()->images);
    }

    /**
     * TEST 19: Update rejects remove_image paths with directory traversal
     *
     * Security: paths like ../users/avatars/admin.jpg must not be passed to Storage::delete.
     */
    public function test_update_rejects_remove_image_paths_with_traversal(): void
    {
        // Arrange
        $disk = 'public';
        Storage::fake($disk);

        $victimPath = 'users/avatars/admin.jpg';
        Storage::disk($disk)->put($victimPath, 'fake-bytes');

        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'images' => ['projects/legit.jpg'],
        ]);

        // Act — try to escape the projects/ prefix
        $response = $this->actingAs($this->user)
            ->put("/projects/{$project->slug}", [
                'title' => $project->title,
                'description' => $project->description,
                'techs' => $this->techIds,
                'remove_images' => ['../users/avatars/admin.jpg', 'projects/../users/avatars/admin.jpg'],
            ]);

        // Assert — victim file untouched and project's own image list intact
        $response->assertRedirect();
        Storage::disk($disk)->assertExists($victimPath);
        $this->assertEquals(['projects/legit.jpg'], $project->fresh()->images);
    }

    /**
     * TEST 20: deleteImages guard rejects paths outside projects/ prefix
     *
     * Defense-in-depth: even if a caller forgets to scope the input, deleteImages
     * itself must refuse anything outside projects/ or containing traversal.
     */
    public function test_delete_images_guard_rejects_unsafe_paths(): void
    {
        // Arrange
        $disk = 'public';
        Storage::fake($disk);

        $victimAvatar = 'users/avatars/admin.jpg';
        $victimRoot = 'secrets.txt';
        $projectImage = 'projects/legit.jpg';

        Storage::disk($disk)->put($victimAvatar, 'a');
        Storage::disk($disk)->put($victimRoot, 'b');
        Storage::disk($disk)->put($projectImage, 'c');

        $service = new \App\Services\ProjectService();

        // Act — feed the service a mix of malicious + valid paths
        $service->deleteImages([
            '../users/avatars/admin.jpg',
            'projects/../users/avatars/admin.jpg',
            '/etc/passwd',
            'secrets.txt',
            $projectImage,
        ]);

        // Assert — only the legit projects/ path is deleted
        Storage::disk($disk)->assertExists($victimAvatar);
        Storage::disk($disk)->assertExists($victimRoot);
        Storage::disk($disk)->assertMissing($projectImage);
    }
}
