<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ProjectIdeaCategory;
use App\Helpers\ApiResourceTransformer;
use App\Models\ProjectIdea;
use Illuminate\Support\Collection;

final class ProjectIdeaService
{
    /**
     * Published ideas exactly as /projects/create renders them.
     *
     * @return array<int, array<string, mixed>>
     */
    public function publishedForDisplay(): array
    {
        return ApiResourceTransformer::projectIdeas($this->publishedIdeas());
    }

    /**
     * One published idea per ProjectIdeaCategory (lowest sort_order, id tie-break),
     * in enum order. Empty when no published ideas exist.
     *
     * @return array<int, array<string, mixed>>
     */
    public function featuredForOnboarding(): array
    {
        $categoryOrder = array_flip(ProjectIdeaCategory::values());

        $featured = $this->publishedIdeas()
            ->groupBy(fn (ProjectIdea $idea): string => $idea->category->value)
            ->map(fn (Collection $group): ProjectIdea => $group
                ->sortBy([['sort_order', 'asc'], ['id', 'asc']])
                ->first())
            ->sortBy(fn (ProjectIdea $idea): int => $categoryOrder[$idea->category->value] ?? 99)
            ->values();

        return ApiResourceTransformer::projectIdeas($featured);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, ProjectIdea>
     */
    private function publishedIdeas(): Collection
    {
        return ProjectIdea::published()
            ->with('techs:id')
            ->orderBy('sort_order')
            ->get();
    }
}
