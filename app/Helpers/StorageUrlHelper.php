<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class StorageUrlHelper
{
    public static function url(?string $path, ?string $disk = null): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_contains($path, '://') || str_starts_with($path, '/storage/')) {
            return $path;
        }

        $diskName = $disk ?? config('filesystems.default', 'public');

        return Storage::disk($diskName)->url($path);
    }
}
