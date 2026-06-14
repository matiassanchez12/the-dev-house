<?php

namespace App\Helpers;

use App\Models\JoinRequest;
use Illuminate\Database\Eloquent\Model;
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
    ): array
    {
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

        // Scrub creator to safe fields only
        if (isset($data['creator'])) {
            $data['creator'] = self::user($data['creator']);
        }

        // Scrub each participant to safe fields only
        if (isset($data['participants']) && is_array($data['participants'])) {
            $data['participants'] = array_map(fn($p) => self::user($p), $data['participants']);
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
            'participatingProjects',
            'techs',
            'socialLinks',
        ]));

        if (isset($safe['avatar'])) {
            $safe['avatar'] = StorageUrlHelper::url($safe['avatar']);
        }

        if (isset($safe['createdProjects']) && is_array($safe['createdProjects'])) {
            $safe['createdProjects'] = array_map(fn ($project) => self::project($project), $safe['createdProjects']);
        }

        if (isset($safe['participatingProjects']) && is_array($safe['participatingProjects'])) {
            $safe['participatingProjects'] = array_map(fn ($project) => self::project($project), $safe['participatingProjects']);
        }

        if (isset($data['pivot'])) {
            $safe['pivot'] = $data['pivot'];
        }

        return $safe;
    }

    /**
     * Transform a join request to array with disk-aware file URLs.
     * Applicant and project creator are scrubbed to safe fields only.
     */
    public static function joinRequest(Model|array $request): array
    {
        $data = $request instanceof Model ? $request->toArray() : $request;

        // Scrub applicant to safe fields only
        if (isset($data['applicant'])) {
            $data['applicant'] = self::user($data['applicant']);
        }

        if (isset($data['project'])) {
            $data['project'] = self::project($data['project']);
        }

        return $data;
    }

    /**
     * Transform a collection/paginator of projects.
     *
     * @param Collection|\Illuminate\Pagination\LengthAwarePaginator $projects
     * @return array
     */
    public static function projects(Collection|\Illuminate\Pagination\LengthAwarePaginator $projects): array
    {
        return $projects->map(fn($p) => self::project($p))->toArray();
    }

    /**
     * Transform a collection/paginator of users.
     *
     * @param Collection|\Illuminate\Pagination\LengthAwarePaginator $users
     * @return array
     */
    public static function users(Collection|\Illuminate\Pagination\LengthAwarePaginator $users): array
    {
        // If it's a paginator, preserve structure with transformed data
        if ($users instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            return [
                'data' => $users->map(fn($u) => self::user($u))->toArray(),
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

        return $users->map(fn($u) => self::user($u))->toArray();
    }

    /**
     * Transform a collection/paginator of join requests.
     *
     * @param Collection|\Illuminate\Pagination\LengthAwarePaginator $requests
     * @return array
     */
    public static function joinRequests(Collection|\Illuminate\Pagination\LengthAwarePaginator $requests): array
    {
        return $requests->map(fn($r) => self::joinRequest($r))->toArray();
    }
}
