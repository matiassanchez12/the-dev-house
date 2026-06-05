<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    /**
     * Proficiency number to string mapping.
     */
    private const PROFICIENCY_MAP = [
        1 => 'basic',
        2 => 'intermediate',
        3 => 'advanced',
        4 => 'expert',
        5 => 'master',
    ];

    /**
     * Update user's avatar.
     *
     * @return string The stored avatar path
     */
    public function updateAvatar(User $user, UploadedFile $file): string
    {
        // Delete existing avatar if present
        if ($user->avatar) {
            $this->deleteAvatarFile($user->avatar);
        }

        $disk = config('filesystems.default', 'public');

        // Store new avatar on the configured public disk
        $path = $file->store('avatars', $disk);

        // Update user record
        $user->avatar = $path;
        $user->save();

        return $path;
    }

    /**
     * Delete user's avatar from storage and clear the path.
     */
    public function deleteAvatar(User $user): void
    {
        if ($user->avatar) {
            $this->deleteAvatarFile($user->avatar);
            $user->avatar = null;
            $user->save();
        }
    }

    /**
     * Delete avatar file from storage.
     */
    private function deleteAvatarFile(string $path): void
    {
        try {
            Storage::disk(config('filesystems.default', 'public'))->delete($path);
        } catch (\Exception $e) {
            // Ignore if file doesn't exist
        }
    }

    /**
     * Sync user's techs with pivot data (proficiency, years_experience).
     *
     * @param array<array{id: int, proficiency?: string, years_experience?: int}> $techs
     */
    public function syncTechs(User $user, array $techs): void
    {
        if (empty($techs)) {
            $user->techs()->detach();
            return;
        }

        $techsToSync = [];

        foreach ($techs as $tech) {
            $proficiencyValue = null;

            if (isset($tech['proficiency'])) {
                // Handle numeric proficiency (1-5) from form
                if (is_numeric($tech['proficiency'])) {
                    $proficiencyValue = self::PROFICIENCY_MAP[$tech['proficiency']] ?? null;
                } else {
                    // Handle string proficiency directly
                    $proficiencyValue = $tech['proficiency'];
                }
            }

            $techsToSync[$tech['id']] = [
                'years_experience' => $tech['years_experience'] ?? null,
                'proficiency' => $proficiencyValue,
            ];
        }

        $user->techs()->sync($techsToSync);
    }

    /**
     * Delete user's account. Database FK constraints handle cascade deletes.
     */
    public function deleteAccount(User $user): void
    {
        if ($user->avatar) {
            $this->deleteAvatarFile($user->avatar);
        }

        $user->delete();
    }
}
