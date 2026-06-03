<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectService
{
    /**
     * Generate a unique URL-safe slug from a title.
     */
    public function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        $query = Project::where('slug', $slug);
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter++;
            $query = Project::where('slug', $slug);
            if ($excludeId !== null) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
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
     * @param array<UploadedFile> $files
     * @return array<string>
     */
    public function uploadImages(array $files): array
    {
        $disk = config('filesystems.default', 'public');
        $paths = [];
        foreach ($files as $file) {
            $paths[] = $file->store('projects', $disk);
        }
        return $paths;
    }

    /**
     * Delete images from storage.
     *
     * @param array<string> $paths
     */
    public function deleteImages(array $paths): void
    {
        $disk = config('filesystems.default', 'public');
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