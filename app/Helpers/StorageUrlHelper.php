<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class StorageUrlHelper
{
    /**
     * Generate the correct URL for a stored file based on the configured disk.
     */
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        // If it's already a full URL (external storage), return as-is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $disk = config('filesystems.default');

        if ($disk === 's3') {
            return Storage::disk('s3')->url($path);
        }

        return '/storage/' . $path;
    }
}