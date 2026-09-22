<?php

namespace App\Models;

use App\Enums\ProjectIdeaCategory;
use App\Enums\ProjectIdeaDifficulty;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProjectIdea extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'summary',
        'category',
        'difficulty',
        'prefill_title',
        'prefill_description',
        'prefill_vision',
        'illustration_path',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'category' => ProjectIdeaCategory::class,
        'difficulty' => ProjectIdeaDifficulty::class,
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Techs suggested for this idea.
     */
    public function techs(): BelongsToMany
    {
        return $this->belongsToMany(Tech::class, 'project_idea_tech')
            ->withTimestamps();
    }

    /**
     * Only ideas that are published.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
