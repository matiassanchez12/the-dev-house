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
     */
    public static function project(Model|array $project): array
    {
        $data = $project instanceof Model ? $project->toArray() : $project;

        // Transform project images
        $images = $data['images'] ?? [];
        $data['images'] = array_map(fn($img) => StorageUrlHelper::url($img), $images);

        // Transform creator avatar
        if (isset($data['creator']['avatar'])) {
            $data['creator']['avatar'] = StorageUrlHelper::url($data['creator']['avatar']);
        }

        return $data;
    }

    /**
     * Transform a user model to array with full avatar URL.
     */
    public static function user(Model|array $user): array
    {
        $data = $user instanceof Model ? $user->toArray() : $user;

        if (isset($data['avatar'])) {
            $data['avatar'] = StorageUrlHelper::url($data['avatar']);
        }

        return $data;
    }

    /**
     * Transform a join request to array with full URLs.
     */
    public static function joinRequest(Model|array $request): array
    {
        $data = $request instanceof Model ? $request->toArray() : $request;

        // Transform applicant avatar
        if (isset($data['applicant']['avatar'])) {
            $data['applicant']['avatar'] = StorageUrlHelper::url($data['applicant']['avatar']);
        }

        // Transform project images
        if (isset($data['project']['images'])) {
            $images = $data['project']['images'] ?? [];
            $data['project']['images'] = array_map(fn($img) => StorageUrlHelper::url($img), $images);
        }

        return $data;
    }

    /**
     * Transform a collection of projects.
     *
     * @param Collection $projects
     * @return array
     */
    public static function projects(Collection $projects): array
    {
        return $projects->map(fn($p) => self::project($p))->toArray();
    }

    /**
     * Transform a collection of users.
     *
     * @param Collection $users
     * @return array
     */
    public static function users(Collection $users): array
    {
        return $users->map(fn($u) => self::user($u))->toArray();
    }

    /**
     * Transform a collection of join requests.
     *
     * @param Collection $requests
     * @return array
     */
    public static function joinRequests(Collection $requests): array
    {
        return $requests->map(fn($r) => self::joinRequest($r))->toArray();
    }
}