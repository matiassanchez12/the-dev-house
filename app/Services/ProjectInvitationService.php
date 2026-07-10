<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationReceived;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProjectInvitationService
{
    public function __construct(
        private readonly CollaboratorSuggestionService $collaboratorSuggestionService,
    ) {}

    public function create(Project $project, int $invitedUserId, ?string $message = null): ProjectInvitation
    {
        if ($invitedUserId === $project->user_id) {
            throw ValidationException::withMessages([
                'invited_user_id' => 'You cannot invite yourself to your own project.',
            ]);
        }

        if ($project->participants()->whereKey($invitedUserId)->exists()) {
            throw ValidationException::withMessages([
                'invited_user_id' => 'This user is already a project participant.',
            ]);
        }

        if ($this->hasActiveInvitation($project, $invitedUserId)) {
            throw ValidationException::withMessages([
                'invited_user_id' => 'This user already has an active invitation for this project.',
            ]);
        }

        if (! $this->collaboratorSuggestionService->isEligibleForProject($project, $invitedUserId)) {
            throw ValidationException::withMessages([
                'invited_user_id' => 'This user is not eligible for a project invitation.',
            ]);
        }

        try {
            $invitation = $this->persistInvitation($project, $invitedUserId, $message);
        } catch (QueryException $exception) {
            if (! $this->isUniqueConstraintViolation($exception)) {
                throw $exception;
            }

            throw ValidationException::withMessages([
                'invited_user_id' => 'This user already has an active invitation for this project.',
            ]);
        }

        return $invitation;
    }

    protected function persistInvitation(Project $project, int $invitedUserId, ?string $message = null): ProjectInvitation
    {
        return DB::transaction(function () use ($project, $invitedUserId, $message): ProjectInvitation {
            $invitation = $project->invitations()->create([
                'invited_user_id' => $invitedUserId,
                'message' => $message,
                'status' => ProjectInvitation::STATUS_PENDING,
            ]);

            $invitation->load(['project.creator', 'invitedUser']);

            /** @var User $invitedUser */
            $invitedUser = $invitation->invitedUser;
            $invitedUser->notify(new ProjectInvitationReceived($invitation));

            return $invitation;
        });
    }

    public function cancel(ProjectInvitation $invitation): ProjectInvitation
    {
        if ($invitation->status !== ProjectInvitation::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => 'Only pending invitations can be cancelled.',
            ]);
        }

        $invitation->update([
            'status' => ProjectInvitation::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        return $invitation->refresh();
    }

    private function hasActiveInvitation(Project $project, int $invitedUserId): bool
    {
        return ProjectInvitation::query()
            ->where('project_id', $project->id)
            ->where('invited_user_id', $invitedUserId)
            ->where('status', ProjectInvitation::STATUS_PENDING)
            ->exists();
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        return $exception instanceof UniqueConstraintViolationException;
    }
}
