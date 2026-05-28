<?php

namespace App\Http\Controllers;

use App\Http\Requests\Onboarding\SaveStep1Request;
use App\Http\Requests\Onboarding\SaveStep2Request;
use App\Http\Requests\Onboarding\SaveStep3Request;
use App\Http\Requests\Onboarding\SaveStep4Request;
use App\Http\Requests\Onboarding\SaveStepSocialLinksRequest;
use App\Services\OnboardingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OnboardingController extends Controller
{
    private OnboardingService $onboardingService;

    public function __construct(OnboardingService $onboardingService)
    {
        $this->onboardingService = $onboardingService;
    }

    public function index()
    {
        $user = Auth::user();

        if ($user->hasCompletedOnboarding()) {
            return redirect()->route('dashboard');
        }

        $allTechs = \App\Models\Tech::all();
        $userTechs = $user->techs()->withPivot('proficiency')->get();

        return inertia('onboarding/index', [
            'user' => ['bio' => $user->bio, 'avatar' => $user->avatar],
            'allTechs' => $allTechs,
            'userTechs' => $userTechs,
        ]);
    }

    public function saveStep1(SaveStep1Request $request)
    {
        $this->onboardingService->saveTechs(Auth::user(), $request->validated()['techs']);

        return redirect()->route('onboarding.index');
    }

    public function saveStep2(SaveStep2Request $request)
    {
        $this->onboardingService->saveBio(Auth::user(), $request->validated()['bio'] ?? null);
        return redirect()->route('onboarding.index');
    }

    public function saveStepSocialLinks(SaveStepSocialLinksRequest $request)
    {
        $this->onboardingService->saveSocialLinks(Auth::user(), $request->validated()['links']);

        return redirect()->route('onboarding.index');
    }

    public function saveStep3(SaveStep3Request $request)
    {
        if ($request->hasFile('avatar')) {
            $this->onboardingService->saveAvatar(Auth::user(), $request->file('avatar'));
        }
        return redirect()->route('onboarding.index');
    }

    public function saveStep4(SaveStep4Request $request)
    {
        $joinRequests = $request->validated()['join_requests'] ?? [];
        if (!empty($joinRequests)) {
            $this->onboardingService->sendJoinRequests(Auth::user(), $joinRequests);
        }

        return $this->complete();
    }

    public function skip()
    {
        return $this->complete();
    }

    public function recommendations()
    {
        $projects = $this->onboardingService->getRecommendations(Auth::user());

        return response()->json([
            'projects' => $projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'slug' => $project->slug,
                    'techs' => $project->techs->map(fn($t) => ['id' => $t->id, 'name' => $t->name]),
                    'creator' => $project->creator ? ['id' => $project->creator->id, 'name' => $project->creator->name] : null,
                ];
            }),
        ]);
    }

    private function complete()
    {
        $this->onboardingService->complete(Auth::user());
        return redirect()->route('dashboard');
    }
}
