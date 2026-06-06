<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'vision',
        'images',
        'status',
        'repository_url',
        'demo_url',
    ];

    protected $casts = [
        'images' => 'array',
        'status' => ProjectStatus::class,
    ];

    /**
     * El creator del proyecto
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Techs requeridos para el proyecto
     */
    public function techs(): BelongsToMany
    {
        return $this->belongsToMany(Tech::class, 'project_tech')
                    ->withPivot('level')
                    ->withTimestamps();
    }

    /**
     * Solicitudes de ingreso al proyecto
     */
    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    /**
     * Mensajes del chat del proyecto
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    /**
     * Determine whether the given user belongs to the project chat.
     */
    public function isMember(User $user): bool
    {
        return $this->user_id === $user->id
            || $this->participants()->whereKey($user->id)->exists();
    }

    /**
     * Participantes aprobados del proyecto
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_participants')
                    ->withTimestamps();
    }
}
