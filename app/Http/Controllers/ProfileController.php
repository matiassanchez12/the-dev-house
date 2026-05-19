<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Tech;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $userTechs = $user->techs()->withPivot('years_experience', 'proficiency')->get();
        $allTechs = Tech::orderBy('name')->get();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'userTechs' => $userTechs,
            'allTechs' => $allTechs,
        ]);
    }

    /**
     * Update the user's profile information (basic info).
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's complete profile (bio, avatar, techs).
     */
    public function updateComplete(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
            'techs' => ['array'],
            'techs.*.id' => ['exists:techs,id'],
            'techs.*.years_experience' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'techs.*.proficiency' => ['nullable', 'numeric', 'min:1', 'max:5'],
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        // Update bio
        if (isset($validated['bio'])) {
            $user->bio = $validated['bio'];
        }

        $user->save();

        // Sync techs with pivot data
        if (isset($validated['techs'])) {
            $techsToSync = [];
            foreach ($validated['techs'] as $tech) {
                // Convert proficiency number to string (migration expects string)
                $proficiencyMap = [
                    1 => 'basic',
                    2 => 'intermediate',
                    3 => 'advanced',
                    4 => 'expert',
                    5 => 'master',
                ];
                $proficiencyValue = isset($tech['proficiency']) ? $proficiencyMap[$tech['proficiency']] ?? null : null;
                
                $techsToSync[$tech['id']] = [
                    'years_experience' => $tech['years_experience'] ?? null,
                    'proficiency' => $proficiencyValue,
                ];
            }
            $user->techs()->sync($techsToSync);
        }

        return Redirect::route('profile.edit')->with('success', 'Perfil actualizado exitosamente!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
