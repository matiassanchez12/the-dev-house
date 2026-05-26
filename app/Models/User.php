<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the route key name for implicit route binding.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'avatar',
        'bio',
        'email',
        'name',
        'onboarding_completed_at',
        'password',
        'slug',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'onboarding_completed_at' => 'datetime',
        ];
    }

    /**
     * Proyectos que este usuario creó
     */
    public function createdProjects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Project::class, 'user_id');
    }

    /**
     * Proyectos donde este usuario es participante
     */
    public function participatingProjects(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_participants')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Techs que conoce este usuario
     */
    public function techs(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Tech::class, 'user_tech')
                    ->withPivot('years_experience', 'proficiency')
                    ->withTimestamps();
    }

    /**
     * Solicitudes de ingreso que envió este usuario
     */
    public function sentJoinRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JoinRequest::class, 'user_id');
    }

    /**
     * Solicitudes de ingreso para proyectos de este usuario (como creator)
     */
    public function receivedJoinRequests(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(JoinRequest::class, Project::class, 'user_id', 'project_id');
    }

    /**
     * Mensajes que envió este usuario
     */
    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Verificar si el usuario completó el onboarding.
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }
}
