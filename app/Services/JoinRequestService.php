<?php

namespace App\Services;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use App\Notifications\JoinRequestApproved;
use App\Notifications\JoinRequestReceived;
use App\Notifications\JoinRequestRejected;
use App\Services\Exceptions\DuplicateJoinRequestException;
use App\Services\Exceptions\SelfJoinException;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class JoinRequestService
{
    /**
     * Validate that a user can create a join request for a project.
     *
     * @throws DuplicateJoinRequestException
     * @throws SelfJoinException
     */
    public function validateCanCreate(Project $project, User $user): void
    {
        // Check for existing pending request
        $existing = JoinRequest::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            throw new DuplicateJoinRequestException();
        }

        // Check for self-join
        if ($project->user_id === $user->id) {
            throw new SelfJoinException();
        }
    }

    /**
     * Create a new join request.
     *
     * @throws DuplicateJoinRequestException
     */
    public function create(Project $project, User $user, string $message): JoinRequest
    {
        try {
            $joinRequest = JoinRequest::create([
                'project_id' => $project->id,
                'user_id' => $user->id,
                'message' => $message,
                'status' => 'pending',
            ]);

            $joinRequest->load('project', 'applicant');
            $project->creator->notify(new JoinRequestReceived($joinRequest));

            return $joinRequest;
        } catch (QueryException $e) {
            if ($this->isUniqueConstraintError($e)) {
                throw new DuplicateJoinRequestException();
            }

            throw $e;
        }
    }

    private function isUniqueConstraintError(QueryException $e): bool
    {
        return $e instanceof UniqueConstraintViolationException;
    }

    /**
     * Approve a join request and attach user as participant.
     */
    public function approve(JoinRequest $joinRequest): void
    {
        DB::transaction(function () use ($joinRequest) {
            $joinRequest->update([
                'status' => 'approved',
                'reviewed_at' => now(),
            ]);

            // Attach user as participant if not already attached
            $project = $joinRequest->project;
            if (! $project->participants()->where('user_id', $joinRequest->user_id)->exists()) {
                $project->participants()->attach($joinRequest->user_id);
            }
        });

        $joinRequest->load('project', 'applicant');
        $joinRequest->applicant->notify(new JoinRequestApproved($joinRequest));
    }

    /**
     * Reject a join request.
     */
    public function reject(JoinRequest $joinRequest): void
    {
        DB::transaction(function () use ($joinRequest) {
            $joinRequest->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
            ]);
        });

        $joinRequest->load('project', 'applicant');
        $joinRequest->applicant->notify(new JoinRequestRejected($joinRequest));
    }

    /**
     * Cancel (delete) a join request.
     */
    public function cancel(JoinRequest $joinRequest): void
    {
        $joinRequest->delete();
    }

    /**
     * Get dashboard data for join requests (received + sent).
     *
     * @return array{receivedRequests: \Illuminate\Support\Collection, sentRequests: \Illuminate\Support\Collection}
     */
    public function getIndexData(User $user): array
    {
        // Solicitudes recibidas (como creator)
        $receivedRequests = JoinRequest::with(['applicant', 'project'])
            ->whereHas('project', fn($q) => $q->where('user_id', $user->id))
            ->where('status', 'pending')
            ->latest()
            ->get();

        // Solicitudes enviadas (como applicant)
        $sentRequests = JoinRequest::with(['project'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return [
            'receivedRequests' => $receivedRequests,
            'sentRequests' => $sentRequests,
        ];
    }
}