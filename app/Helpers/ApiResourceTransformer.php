<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Models\JoinRequest;
use App\Models\ProjectInvitation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Transform Eloquent models/collections to API-safe arrays with disk-aware file URLs.
 */
class ApiResourceTransformer
{
    /**
     * Transform a project model to array with disk-aware image URLs.
     * Creator and participants are scrubbed to safe fields only.
     */
    public static function project(
        Model|array $project,
        ?JoinRequest $viewerJoinRequest = null,
        ?string $viewerRole = null,
    ): array {
        $data = $project instanceof Model ? $project->toArray() : $project;

        if (isset($data['images']) && is_array($data['images'])) {
            $data['images'] = array_map(
                fn ($img) => [
                    'path' => $img,
                    'url' => StorageUrlHelper::url($img),
                ],
                $data['images']
            );
        }

        if (isset($data['creator'])) {
            $data['creator'] = self::user($data['creator']);
        }

        if (isset($data['participants']) && is_array($data['participants'])) {
            $data['participants'] = array_map(fn ($participant) => self::user($participant), $data['participants']);
        }

        if (isset($data['invitations']) && is_array($data['invitations'])) {
            $data['invitations'] = array_map(fn ($invitation) => self::projectInvitation($invitation), $data['invitations']);
        }

        if (isset($data['messages']) && is_array($data['messages'])) {
            $data['messages'] = array_map(fn ($message) => self::message($message), $data['messages']);
        }

        if (isset($data['phases']) && is_array($data['phases'])) {
            $data['phases'] = array_map(fn ($phase) => self::phase($phase), $data['phases']);
        }

        if ($viewerRole !== null) {
            $data['viewer_role'] = $viewerRole;
        }

        $data['viewerJoinRequest'] = $viewerJoinRequest === null
            ? null
            : [
                'id' => $viewerJoinRequest->id,
                'status' => $viewerJoinRequest->status,
                'message' => $viewerJoinRequest->message,
            ];

        return $data;
    }

    /**
     * Transform a phase to a safe array.
     */
    public static function phase(Model|array $phase): array
    {
        $data = $phase instanceof Model ? $phase->toArray() : $phase;

        if (isset($data['project'])) {
            $data['project'] = self::project($data['project']);
        }

        return array_intersect_key($data, array_flip([
            'id',
            'title',
            'description',
            'completed_at',
            'created_at',
            'updated_at',
            'project',
        ]));
    }

    /**
     * Transform a message to a safe array with sender details.
     */
    public static function message(Model|array $message): array
    {
        $data = $message instanceof Model ? $message->toArray() : $message;

        if (isset($data['sender'])) {
            $data['sender'] = self::user($data['sender']);
        }

        return $data;
    }

    /**
     * Transform a user model to array with safe fields and disk-aware avatar URLs.
     */
    public static function user(Model|array $user): array
    {
        $data = $user instanceof Model ? $user->toArray() : $user;

        $safe = array_intersect_key($data, array_flip([
            'id',
            'name',
            'slug',
            'bio',
            'avatar',
            'created_projects_count',
            'joined_projects_count',
            'createdProjects',
            'created_projects',
            'participatingProjects',
            'participating_projects',
            'receivedInvitations',
            'received_invitations',
            'techs',
            'socialLinks',
            'social_links',
        ]));

        if (isset($safe['avatar'])) {
            $safe['avatar'] = StorageUrlHelper::url($safe['avatar']);
        }

        if (isset($safe['createdProjects']) && is_array($safe['createdProjects'])) {
            $safe['createdProjects'] = array_map(fn ($project) => self::project($project), $safe['createdProjects']);
        }

        if (isset($safe['created_projects']) && is_array($safe['created_projects'])) {
            $safe['created_projects'] = array_map(fn ($project) => self::project($project), $safe['created_projects']);
        }

        if (isset($safe['participatingProjects']) && is_array($safe['participatingProjects'])) {
            $safe['participatingProjects'] = array_map(fn ($project) => self::project($project), $safe['participatingProjects']);
        }

        if (isset($safe['participating_projects']) && is_array($safe['participating_projects'])) {
            $safe['participating_projects'] = array_map(fn ($project) => self::project($project), $safe['participating_projects']);
        }

        if (isset($safe['receivedInvitations']) && is_array($safe['receivedInvitations'])) {
            $safe['receivedInvitations'] = array_map(fn ($invitation) => self::projectInvitation($invitation), $safe['receivedInvitations']);
        }

        if (isset($safe['received_invitations']) && is_array($safe['received_invitations'])) {
            $safe['received_invitations'] = array_map(fn ($invitation) => self::projectInvitation($invitation), $safe['received_invitations']);
        }

        if (isset($safe['techs']) && is_array($safe['techs'])) {
            $safe['techs'] = array_map(fn ($tech) => self::tech($tech), $safe['techs']);
        }

        if (isset($safe['socialLinks']) && is_array($safe['socialLinks'])) {
            $safe['socialLinks'] = array_map(fn ($link) => $link, $safe['socialLinks']);
        }

        if (isset($safe['social_links']) && is_array($safe['social_links'])) {
            $safe['social_links'] = array_map(fn ($link) => $link, $safe['social_links']);
        }

        if (isset($data['pivot'])) {
            $safe['pivot'] = $data['pivot'];
        }

        return $safe;
    }

    /**
     * Transform an outbound project invitation to a safe array.
     */
    public static function projectInvitation(Model|array $invitation): array
    {
        $data = $invitation instanceof Model ? $invitation->toArray() : $invitation;

        if (isset($data['project'])) {
            $data['project'] = self::project($data['project']);
        }

        if (isset($data['invited_user'])) {
            $data['invited_user'] = self::user($data['invited_user']);
        }

        if (isset($data['invitedUser'])) {
            $data['invitedUser'] = self::user($data['invitedUser']);
        }

        return array_intersect_key($data, array_flip([
            'id',
            'project_id',
            'invited_user_id',
            'status',
            'message',
            'cancelled_at',
            'created_at',
            'updated_at',
            'project',
            'invited_user',
            'invitedUser',
        ]));
    }

    /**
     * Transform a collaborator suggestion to a safe array.
     */
    public static function collaboratorSuggestion(Model|array $suggestion): array
    {
        $data = $suggestion instanceof Model ? $suggestion->toArray() : $suggestion;

        if (isset($data['user'])) {
            $data['user'] = self::user($data['user']);
        }

        if (isset($data['matching_techs']) && is_array($data['matching_techs'])) {
            $data['matching_techs'] = array_map(fn ($tech) => self::tech($tech), $data['matching_techs']);
        }

        if (isset($data['pending_invitation'])) {
            $data['pending_invitation'] = self::projectInvitation($data['pending_invitation']);
        }

        return array_intersect_key($data, array_flip([
            'user',
            'matching_techs',
            'pending_invitation',
        ]));
    }

    /**
     * Transform a tech model to a safe array.
     */
    public static function tech(Model|array $tech): array
    {
        $data = $tech instanceof Model ? $tech->toArray() : $tech;

        return array_intersect_key($data, array_flip([
            'id',
            'name',
            'slug',
            'icon',
        ]));
    }

    /**
     * Transform a collection/paginator of projects.
     *
     * @param Collection|LengthAwarePaginator $projects
     * @return array
     */
    public static function projects(Collection|LengthAwarePaginator $projects): array
    {
        return $projects->map(fn ($project) => self::project($project))->toArray();
    }

    /**
     * Transform a collection/paginator of project invitations.
     *
     * @param Collection|LengthAwarePaginator $invitations
     * @return array
     */
    public static function projectInvitations(Collection|LengthAwarePaginator $invitations): array
    {
        if ($invitations instanceof LengthAwarePaginator) {
            return [
                'data' => $invitations->map(fn ($invitation) => self::projectInvitation($invitation))->toArray(),
                'links' => $invitations->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $invitations->currentPage(),
                    'last_page' => $invitations->lastPage(),
                    'per_page' => $invitations->perPage(),
                    'total' => $invitations->total(),
                    'from' => $invitations->firstItem(),
                    'to' => $invitations->lastItem(),
                ],
            ];
        }

        return $invitations->map(fn ($invitation) => self::projectInvitation($invitation))->toArray();
    }

    /**
     * Transform a collection/paginator of collaborator suggestions.
     *
     * @param Collection|LengthAwarePaginator $suggestions
     * @return array
     */
    public static function collaboratorSuggestions(Collection|LengthAwarePaginator $suggestions): array
    {
        if ($suggestions instanceof LengthAwarePaginator) {
            return [
                'data' => $suggestions->map(fn ($suggestion) => self::collaboratorSuggestion($suggestion))->toArray(),
                'links' => $suggestions->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $suggestions->currentPage(),
                    'last_page' => $suggestions->lastPage(),
                    'per_page' => $suggestions->perPage(),
                    'total' => $suggestions->total(),
                    'from' => $suggestions->firstItem(),
                    'to' => $suggestions->lastItem(),
                ],
            ];
        }

        return $suggestions->map(fn ($suggestion) => self::collaboratorSuggestion($suggestion))->toArray();
    }

    /**
     * Transform a collection/paginator of users.
     *
     * @param Collection|LengthAwarePaginator $users
     * @return array
     */
    public static function users(Collection|LengthAwarePaginator $users): array
    {
        if ($users instanceof LengthAwarePaginator) {
            return [
                'data' => $users->map(fn ($user) => self::user($user))->toArray(),
                'links' => $users->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ],
            ];
        }

        return $users->map(fn ($user) => self::user($user))->toArray();
    }

    /**
     * Transform a collection/paginator of join requests.
     *
     * @param Collection|LengthAwarePaginator $requests
     * @return array
     */
    public static function joinRequests(Collection|LengthAwarePaginator $requests): array
    {
        return $requests->map(fn ($request) => self::joinRequest($request))->toArray();
    }

    /**
     * Transform a join request to a safe array.
     */
    public static function joinRequest(Model|array $request): array
    {
        $data = $request instanceof Model ? $request->toArray() : $request;

        if (isset($data['project'])) {
            $data['project'] = self::project($data['project']);
        }

        if (isset($data['applicant'])) {
            $data['applicant'] = self::user($data['applicant']);
        }

        return array_intersect_key($data, array_flip([
            'id',
            'project_id',
            'user_id',
            'status',
            'message',
            'reviewed_at',
            'created_at',
            'updated_at',
            'project',
            'applicant',
        ]));
    }

    /**
     * Transform a collection/paginator of techs.
     *
     * @param Collection|LengthAwarePaginator $techs
     * @return array
     */
    public static function techs(Collection|LengthAwarePaginator $techs): array
    {
        if ($techs instanceof LengthAwarePaginator) {
            return [
                'data' => $techs->map(fn ($tech) => self::tech($tech))->toArray(),
                'links' => $techs->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $techs->currentPage(),
                    'last_page' => $techs->lastPage(),
                    'per_page' => $techs->perPage(),
                    'total' => $techs->total(),
                    'from' => $techs->firstItem(),
                    'to' => $techs->lastItem(),
                ],
            ];
        }

        return $techs->map(fn ($tech) => self::tech($tech))->toArray();
    }
}
