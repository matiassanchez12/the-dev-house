<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tech extends Model
{
    use HasFactory;
    
    protected $table = 'techs';

    protected $fillable = [
        'name',
        'slug',
        'icon',
    ];

    /**
     * Proyectos que usan este tech
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_tech')
                    ->withPivot('level')
                    ->withTimestamps();
    }

    /**
     * Usuarios que conocen este tech
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_tech')
                    ->using(UserTech::class)
                    ->withPivot('years_experience', 'proficiency')
                    ->withTimestamps();
    }
}
