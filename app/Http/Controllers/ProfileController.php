<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateCompleteProfileRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Tech;
use App\Services\ProfileService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService
    ) {}

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $userTechs = $user->techs()->withPivot('years_experience', 'proficiency')->get();
        $allTechs = Tech::orderBy('name')->get();

        return Inertia::render('profile/edit', [
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
    public function updateComplete(UpdateCompleteProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle avatar upload via service
        if ($request->hasFile('avatar')) {
            $this->profileService->updateAvatar($user, $request->file('avatar'));
        }

        // Update bio
        if (isset($validated['bio'])) {
            $user->bio = $validated['bio'];
            $user->save();
        }

        // Sync techs with pivot data via service
        if (isset($validated['techs'])) {
            $this->profileService->syncTechs($user, $validated['techs']);
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

        $this->profileService->deleteAccount($user);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}