<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Transform Eloquent models/collections to API-safe arrays with full S3 URLs.
 */
class ApiResourceTransformer
{
    /**
     * Transform a project model to array with full image URLs.
     * Creator and participants are scrubbed to safe fields only.
     */
    public static function project(Model|array $project): array
    {
        $data = $project instanceof Model ? $project->toArray() : $project;

        // Scrub creator to safe fields only
        if (isset($data['creator'])) {
            $data['creator'] = self::user($data['creator']);
        }

        // Scrub each participant to safe fields only
        if (isset($data['participants']) && is_array($data['participants'])) {
            $data['participants'] = array_map(fn($p) => self::user($p), $data['participants']);
        }

        return $data;
    }

    /**
     * Transform a user model to array with safe fields only.
     * Never exposes email, timestamps, or internal data.
     */
    public static function user(Model|array $user): array
    {
        $data = $user instanceof Model ? $user->toArray() : $user;

        $safe = array_intersect_key($data, array_flip(['id', 'name', 'slug', 'bio', 'avatar', 'createdProjects', 'participatingProjects', 'techs', 'socialLinks']));

        if (isset($data['pivot'])) {
            $safe['pivot'] = $data['pivot'];
        }

        return $safe;
    }

    /**
     * Transform a join request to array with full URLs.
     * Applicant and project creator are scrubbed to safe fields only.
     */
    public static function joinRequest(Model|array $request): array
    {
        $data = $request instanceof Model ? $request->toArray() : $request;

        // Scrub applicant to safe fields only
        if (isset($data['applicant'])) {
            $data['applicant'] = self::user($data['applicant']);
        }

        // Scrub project creator to safe fields only
        if (isset($data['project']['creator'])) {
            $data['project']['creator'] = self::user($data['project']['creator']);
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
