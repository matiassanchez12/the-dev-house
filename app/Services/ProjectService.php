<?php

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectService
{
    private function mediaDisk(): string
    {
        return config('filesystems.media_disk', 'public');
    }

    public function viewerRole(Project $project, ?User $viewer): string
    {
        if ($viewer === null) {
            return 'guest';
        }

        if ($project->user_id === $viewer->id) {
            return 'creator';
        }

        if ($project->relationLoaded('participants')) {
            return $project->participants->contains('id', $viewer->id)
                ? 'member'
                : 'guest';
        }

        return $project->participants()->whereKey($viewer->id)->exists()
            ? 'member'
            : 'guest';
    }

    /**
     * Generate a unique URL-safe slug from a title.
     */
    public function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;

        $query = Project::where('slug', $slug);
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if (! $query->exists()) {
            return $slug;
        }

        $pattern = $originalSlug.'-%';
        $existing = Project::where('slug', 'LIKE', $pattern);
        if ($excludeId !== null) {
            $existing->where('id', '!=', $excludeId);
        }

        $maxSuffix = $existing->pluck('slug')
            ->map(fn ($s) => (int) Str::after($s, $originalSlug.'-'))
            ->max();

        return $originalSlug.'-'.(max($maxSuffix, 0) + 1);
    }

    /**
     * Create a new project with tech associations.
     */
    public function create(User $user, array $data): Project
    {
        $slug = $this->generateUniqueSlug($data['title']);

        // Handle image uploads
        $imagePaths = [];
        if (! empty($data['images'])) {
            $imagePaths = $this->uploadImages($data['images']);
        }

        $project = $user->createdProjects()->create([
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'],
            'vision' => $data['vision'] ?? null,
            'images' => $imagePaths,
            'repository_url' => $data['repository_url'] ?? null,
            'demo_url' => $data['demo_url'] ?? null,
        ]);

        if (! empty($data['techs'])) {
            $project->techs()->attach($data['techs']);
        }

        return $project;
    }

    /**
     * Update an existing project.
     */
    public function update(Project $project, array $data): Project
    {
        // Regenerate slug if title changed
        if (isset($data['title']) && $data['title'] !== $project->title) {
            $project->slug = $this->generateUniqueSlug($data['title'], $project->id);
        }

        // Handle new image uploads
        $newImages = [];
        if (! empty($data['images'])) {
            $newImages = $this->uploadImages($data['images']);
        }

        // Merge new images with existing
        $existingImages = $project->images ?? [];
        $allImages = array_merge($existingImages, $newImages);

        // Handle image removal
        if (! empty($data['remove_images'])) {
            $ownedImages = $project->images ?? [];
            $toRemove = array_values(array_intersect($data['remove_images'], $ownedImages));

            if (! empty($toRemove)) {
                $this->deleteImages($toRemove);
                $allImages = array_values(array_filter(
                    $allImages,
                    fn ($img) => ! in_array($img, $toRemove)
                ));
            }
        }

        $project->update([
            'title' => $data['title'],
            'slug' => $project->slug,
            'description' => $data['description'],
            'vision' => $data['vision'] ?? null,
            'images' => $allImages,
            'repository_url' => $data['repository_url'] ?? null,
            'demo_url' => $data['demo_url'] ?? null,
        ]);

        // Sync techs
        if (isset($data['techs'])) {
            $project->techs()->sync($data['techs']);
        }

        return $project;
    }

    /**
     * Upload images and return stored paths.
     *
     * @param  array<UploadedFile>  $files
     * @return array<string>
     */
    public function uploadImages(array $files): array
    {
        $disk = $this->mediaDisk();
        $paths = [];
        foreach ($files as $file) {
            $path = $file->store('projects', $disk);

            if ($path === false) {
                throw new \RuntimeException('Unable to store project image.');
            }

            $paths[] = $path;
        }

        return $paths;
    }

    /**
     * Delete images from storage.
     *
     * @param  array<string>  $paths
     */
    public function deleteImages(array $paths): void
    {
        $disk = $this->mediaDisk();
        foreach ($paths as $path) {
            if (! $this->isSafeImagePath($path)) {
                continue;
            }

            try {
                Storage::disk($disk)->delete($path);
            } catch (\Exception $e) {
                // Ignore if file doesn't exist
            }
        }
    }

    private function isSafeImagePath(string $path): bool
    {
        if ($path === '' || str_contains($path, '..') || str_contains($path, "\0")) {
            return false;
        }

        return str_starts_with($path, 'projects/');
    }

    /**
     * Update the project status with transition validation.
     *
     * @throws \InvalidArgumentException
     */
    public function updateStatus(Project $project, ProjectStatus $newStatus): void
    {
        $currentStatus = $project->status;

        if (! $currentStatus instanceof ProjectStatus) {
            $currentStatus = ProjectStatus::tryFrom($currentStatus);
        }

        if (! $currentStatus?->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException('Invalid project status transition.');
        }

        $project->update(['status' => $newStatus->value]);
    }

    /**
     * Delete a project and its images.
     */
    public function delete(Project $project): void
    {
        // Delete associated images
        if (! empty($project->images)) {
            $this->deleteImages($project->images);
        }

        $project->delete();
    }
}
