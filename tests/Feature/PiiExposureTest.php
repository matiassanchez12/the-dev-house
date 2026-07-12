<?php

namespace Tests\Feature;

use App\Helpers\ApiResourceTransformer;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PiiExposureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'bio' => 'A developer',
        ]);
    }

    public function test_global_auth_user_does_not_expose_email(): void
    {
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->missing('auth.user.email')
        );
    }

    public function test_global_auth_user_does_not_expose_timestamps(): void
    {
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->missing('auth.user.created_at')
            ->missing('auth.user.updated_at')
            ->missing('auth.user.email_verified_at')
        );
    }

    public function test_global_auth_user_exposes_safe_fields(): void
    {
        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.id', $this->user->id)
            ->where('auth.user.name', $this->user->name)
            ->where('auth.user.slug', $this->user->slug)
            ->where('auth.user.bio', $this->user->bio)
        );
    }

    public function test_profile_edit_page_receives_email_as_prop(): void
    {
        $response = $this->actingAs($this->user)->get(route('profile.edit'));

        $response->assertInertia(fn ($page) => $page
            ->where('email', $this->user->email)
            ->where('phone', $this->user->phone)
            ->has('privacySetting')
            ->has('emailVerifiedAt')
        );
    }

    public function test_public_page_auth_user_does_not_expose_email_or_phone(): void
    {
        $this->user->update(['phone' => '+541112345678']);

        $response = $this->actingAs($this->user)->get(route('privacy'));

        $response->assertInertia(fn ($page) => $page
            ->missing('auth.user.email')
            ->missing('auth.user.phone')
        );
    }

    public function test_public_milestones_auth_user_does_not_expose_email_or_phone(): void
    {
        $this->user->update(['phone' => '+541112345678']);

        $response = $this->actingAs($this->user)->get(route('milestones.index'));

        $response->assertInertia(fn ($page) => $page
            ->missing('auth.user.email')
            ->missing('auth.user.phone')
        );
    }

    public function test_project_show_does_not_expose_creator_email(): void
    {
        $project = Project::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('projects.show', $project));

        $response->assertInertia(fn ($page) => $page
            ->missing('project.creator.email')
            ->missing('project.creator.created_at')
            ->missing('project.creator.updated_at')
            ->where('project.creator.name', $this->user->name)
        );
    }

    public function test_project_show_does_not_expose_participants_email(): void
    {
        $project = Project::factory()->create(['user_id' => $this->user->id]);
        $participant = User::factory()->create();
        $project->participants()->attach($participant->id);

        $response = $this->actingAs($this->user)
            ->get(route('projects.show', $project));

        $response->assertInertia(fn ($page) => $page
            ->missing('project.participants.0.email')
            ->missing('project.participants.0.created_at')
        );
    }

    public function test_landing_page_users_array_does_not_contain_email(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('users.0')
            ->missing('users.0.email')
            ->missing('users.0.created_at')
            ->missing('users.0.updated_at')
        );
    }

    public function test_api_resource_transformer_user_only_returns_safe_fields(): void
    {
        $user = User::factory()->create(['bio' => 'A developer', 'avatar' => 'avatars/test.jpg']);
        $transformed = ApiResourceTransformer::user($user);

        $this->assertArrayHasKey('id', $transformed);
        $this->assertArrayHasKey('name', $transformed);
        $this->assertArrayHasKey('slug', $transformed);
        $this->assertArrayHasKey('bio', $transformed);
        $this->assertArrayHasKey('avatar', $transformed);

        $this->assertArrayNotHasKey('email', $transformed);
        $this->assertArrayNotHasKey('created_at', $transformed);
        $this->assertArrayNotHasKey('updated_at', $transformed);
        $this->assertArrayNotHasKey('email_verified_at', $transformed);
    }
}
