<?php

namespace App\Http\Controllers;

use App\Helpers\StorageUrlHelper;
use App\Http\Requests\JoinRequest\StoreJoinRequestRequest;
use App\Models\JoinRequest;
use App\Models\Project;
use App\Services\Exceptions\DuplicateJoinRequestException;
use App\Services\Exceptions\SelfJoinException;
use App\Services\JoinRequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class JoinRequestController extends Controller
{
    public function __construct(
        private JoinRequestService $joinRequestService
    ) {}

    /**
     * Transform request applicant/project avatars.
     */
    private function transformRequest($request): array
    {
        $request = $request->toArray();
        if (isset($request['applicant']['avatar'])) {
            $request['applicant']['avatar'] = StorageUrlHelper::url($request['applicant']['avatar']);
        }
        if (isset($request['project']['images'])) {
            $images = $request['project']['images'] ?? [];
            $request['project']['images'] = array_map(fn($img) => StorageUrlHelper::url($img), $images);
        }
        return $request;
    }

    /**
     * Display a listing of join requests for the current user's projects
     */
    public function index(Request $request)
    {
        $data = $this->joinRequestService->getIndexData(Auth::user());

        $data['receivedRequests'] = $data['receivedRequests']->map(fn($r) => $this->transformRequest($r));
        $data['sentRequests'] = $data['sentRequests']->map(fn($r) => $this->transformRequest($r));

        return Inertia::render('join_requests/index', $data);
    }

    /**
     * Store a newly created join request
     */
    public function store(StoreJoinRequestRequest $request, Project $project)
    {
        try {
            $this->joinRequestService->validateCanCreate($project, Auth::user());
        } catch (DuplicateJoinRequestException) {
            return back()->withErrors([
                'message' => 'Ya tienes una solicitud pendiente para este proyecto',
            ]);
        } catch (SelfJoinException) {
            return back()->withErrors([
                'message' => 'No puedes unirte a tu propio proyecto',
            ]);
        }

        $this->joinRequestService->create($project, Auth::user(), $request->validated()['message']);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Solicitud enviada. El creator te avisará cuando la revise.');
    }

    /**
     * Approve a join request
     */
    public function approve(JoinRequest $joinRequest)
    {
        Gate::authorize('approve', $joinRequest);

        if ($joinRequest->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Esta solicitud ya fue revisada',
            ]);
        }

        $this->joinRequestService->approve($joinRequest);

        return back()->with('success', 'Solicitud aprobada. El usuario ahora es participante.');
    }

    /**
     * Reject a join request
     */
    public function reject(JoinRequest $joinRequest)
    {
        Gate::authorize('reject', $joinRequest);

        if ($joinRequest->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Esta solicitud ya fue revisada',
            ]);
        }

        $this->joinRequestService->reject($joinRequest);

        return back()->with('success', 'Solicitud rechazada.');
    }

    /**
     * Cancel a join request (solo el applicant)
     */
    public function cancel(JoinRequest $joinRequest)
    {
        Gate::authorize('cancel', $joinRequest);

        if ($joinRequest->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Esta solicitud ya fue revisada',
            ]);
        }

        $this->joinRequestService->cancel($joinRequest);

        return back()->with('success', 'Solicitud cancelada.');
    }
}