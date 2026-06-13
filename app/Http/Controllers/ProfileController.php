<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateCompleteProfileRequest;
use App\Http\Requests\Profile\UpdateSocialLinksRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\SocialLink;
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
        $socialLinks = $user->socialLinks;

        return Inertia::render('profile/edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'name' => $user->name,
            'email' => $user->email,
            'emailVerifiedAt' => $user->email_verified_at,
            'userTechs' => $userTechs,
            'socialLinks' => $socialLinks,
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
     * Update the user's social links (replace all).
     */
    public function updateSocialLinks(UpdateSocialLinksRequest $request): RedirectResponse
    {
        $user = $request->user();
        $links = $request->validated()['links'];

        // Separate existing (with id) and new links
        $existingLinks = array_filter($links, fn ($link) => isset($link['id']));
        $newLinks = array_filter($links, fn ($link) => ! isset($link['id']));

        // Update existing links
        foreach ($existingLinks as $link) {
            $socialLink = SocialLink::where('id', $link['id'])
                ->where('user_id', $user->id)
                ->first();

            if ($socialLink) {
                $socialLink->update([
                    'platform' => $link['platform'],
                    'url' => $link['url'],
                ]);
            }
        }

        // Get IDs of links to keep
        $keepIds = array_map(fn ($link) => $link['id'], array_filter($links, fn ($link) => isset($link['id'])));

        // Delete links not in the submitted set
        if (! empty($keepIds)) {
            $user->socialLinks()->whereNotIn('id', $keepIds)->delete();
        } else {
            $user->socialLinks()->delete();
        }

        // Insert new links
        $records = array_map(function ($link) use ($user) {
            return [
                'user_id' => $user->id,
                'platform' => $link['platform'],
                'url' => $link['url'],
            ];
        }, $newLinks);

        if (! empty($records)) {
            foreach ($records as $record) {
                SocialLink::updateOrCreate(
                    [
                        'user_id' => $record['user_id'],
                        'platform' => $record['platform'],
                    ],
                    [
                        'url' => $record['url'],
                    ]
                );
            }
        }

        return Redirect::route('profile.edit')->with('success', 'Links sociales actualizados!');
    }

    /**
     * Delete a single social link.
     */
    public function destroySocialLink(Request $request, SocialLink $socialLink): RedirectResponse
    {
        $user = $request->user();

        // Ensure the user owns this link
        if ($socialLink->user_id !== $user->id) {
            abort(403);
        }

        $socialLink->delete();

        return Redirect::route('profile.edit', [], 303)->with('success', 'Link social eliminado!');
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
