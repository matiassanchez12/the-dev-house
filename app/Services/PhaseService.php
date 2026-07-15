<?php

namespace App\Services;

use App\Models\Phase;
use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class PhaseService
{
    private function mediaDisk(): string
    {
        return config('filesystems.media_disk', 'public');
    }

    public function create(Project $project, array $data, ?UploadedFile $image = null): Phase
    {
        $imagePath = null;

        if ($image) {
            $imagePath = $image->store('phases', $this->mediaDisk());
        }

        return $project->phases()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
            'image_path' => $imagePath,
        ]);
    }

    public function update(Phase $phase, array $data, ?UploadedFile $image = null): Phase
    {
        $updateData = [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
        ];

        if ($image) {
            $this->deleteImageFile($phase->image_path);
            $updateData['image_path'] = $image->store('phases', $this->mediaDisk());
        }

        $phase->update($updateData);

        return $phase->refresh();
    }

    public function delete(Phase $phase): void
    {
        $this->deleteImageFile($phase->image_path);
        $phase->delete();
    }

    public function listFor(Project $project): Collection
    {
        return $project->phases()->orderByDesc('created_at')->get();
    }

    private function deleteImageFile(?string $path): void
    {
        if ($path) {
            try {
                Storage::disk($this->mediaDisk())->delete($path);
            } catch (\Exception $e) {
                // Ignore if file doesn't exist
            }
        }
    }
}
