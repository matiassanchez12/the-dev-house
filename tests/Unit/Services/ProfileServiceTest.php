<?php

namespace Tests\Unit\Services;

use App\Models\Tech;
use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProfileService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        config(['filesystems.default' => 'public']);

        $this->service = new ProfileService();
        $this->user = User::factory()->create();
    }

    // === updateAvatar tests ===

    /** @test */
    public function update_avatar_stores_file_and_returns_path(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 500, 500);

        $path = $this->service->updateAvatar($this->user, $file);

        Storage::disk('public')->assertExists($path);
        $this->assertStringContainsString('avatars/', $path);
    }

    /** @test */
    public function update_avatar_deletes_old_avatar_when_exists(): void
    {
        Storage::fake('public');

        // Upload initial avatar
        $oldFile = UploadedFile::fake()->image('old-avatar.jpg', 500, 500);
        $oldPath = $oldFile->store('avatars', 'public');
        $this->user->avatar = $oldPath;
        $this->user->save();

        Storage::disk('public')->assertExists($oldPath);

        // Update with new avatar
        $newFile = UploadedFile::fake()->image('new-avatar.jpg', 500, 500);
        $newPath = $this->service->updateAvatar($this->user, $newFile);

        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($newPath);
    }

    /** @test */
    public function update_avatar_updates_user_avatar_field(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 500, 500);
        $path = $this->service->updateAvatar($this->user, $file);

        $this->user->refresh();
        $this->assertEquals($path, $this->user->avatar);
    }

    // === deleteAvatar tests ===

    /** @test */
    public function delete_avatar_removes_file_and_clears_path(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 500, 500);
        $path = $file->store('avatars', 'public');
        $this->user->avatar = $path;
        $this->user->save();

        Storage::disk('public')->assertExists($path);

        $this->service->deleteAvatar($this->user);

        Storage::disk('public')->assertMissing($path);
        $this->user->refresh();
        $this->assertNull($this->user->avatar);
    }

    /** @test */
    public function delete_avatar_does_not_throw_when_no_avatar(): void
    {
        Storage::fake('public');

        $this->user->avatar = null;
        $this->user->save();

        // Should not throw
        $this->service->deleteAvatar($this->user);

        $this->assertTrue(true);
    }

    // === syncTechs tests ===

    /** @test */
    public function sync_techs_syncs_with_pivot_data(): void
    {
        $tech1 = Tech::factory()->create();
        $tech2 = Tech::factory()->create();

        $techsData = [
            ['id' => $tech1->id, 'proficiency' => 'basic', 'years_experience' => 2],
            ['id' => $tech2->id, 'proficiency' => 'advanced', 'years_experience' => 5],
        ];

        $this->service->syncTechs($this->user, $techsData);

        $this->user->refresh();
        $this->assertCount(2, $this->user->techs);

        $syncedTech1 = $this->user->techs->find($tech1->id);
        $this->assertEquals('basic', $syncedTech1->pivot->proficiency);
        $this->assertEquals(2, $syncedTech1->pivot->years_experience);
    }

    /** @test */
    public function sync_techs_replaces_existing_techs(): void
    {
        $oldTech = Tech::factory()->create();
        $this->user->techs()->attach($oldTech->id, ['proficiency' => 'basic']);

        $newTech = Tech::factory()->create();
        $techsData = [['id' => $newTech->id, 'proficiency' => 'intermediate']];

        $this->service->syncTechs($this->user, $techsData);

        $this->user->refresh();
        $this->assertCount(1, $this->user->techs);
        $this->assertEquals($newTech->id, $this->user->techs->first()->id);
    }

    /** @test */
    public function sync_techs_with_empty_array_removes_all_techs(): void
    {
        $tech = Tech::factory()->create();
        $this->user->techs()->attach($tech->id, ['proficiency' => 'basic']);

        $this->service->syncTechs($this->user, []);

        $this->user->refresh();
        $this->assertCount(0, $this->user->techs);
    }

    // === deleteAccount tests ===

    /** @test */
    public function delete_account_removes_user_record(): void
    {
        $userId = $this->user->id;

        $this->service->deleteAccount($this->user);

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    /** @test */
    public function delete_account_removes_avatar_file_when_exists(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 500, 500);
        $path = $file->store('avatars', 'public');
        $this->user->avatar = $path;
        $this->user->save();

        Storage::disk('public')->assertExists($path);

        $this->service->deleteAccount($this->user);

        Storage::disk('public')->assertMissing($path);
    }

    /** @test */
    public function delete_account_cascade_deletes_sent_join_requests(): void
    {
        $project = \App\Models\Project::factory()->create();
        $joinRequest = \App\Models\JoinRequest::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
        ]);

        $joinRequestId = $joinRequest->id;

        $this->service->deleteAccount($this->user);

        $this->assertDatabaseMissing('join_requests', ['id' => $joinRequestId]);
    }
}
