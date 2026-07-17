<?php

declare(strict_types=1);

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
        'phone',
        'slug',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'phone',
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
            'phone' => 'encrypted',
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
                    ->using(UserTech::class)
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
     * Invitations received by this user.
     */
    public function receivedInvitations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectInvitation::class, 'invited_user_id');
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
     * Links sociales de este usuario
     */
    public function socialLinks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SocialLink::class);
    }

    /**
     * Preferencias de privacidad de este usuario (1:1).
     */
    public function privacySetting(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserPrivacySetting::class);
    }

    /**
     * Optional collaboration email preferences (1:1).
     */
    public function notificationSetting(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserNotificationSetting::class);
    }

    /**
     * Si el usuario aparece en el directorio público. Default true si nunca
     * creó una fila de preferencias (back-compat con usuarios existentes).
     */
    public function isDiscoverable(): bool
    {
        return $this->privacySetting?->is_discoverable ?? true;
    }

    /**
     * Whether the user wants optional product emails.
     */
    public function receivesOptionalEmailNotifications(): bool
    {
        return $this->notificationSetting?->collaboration_emails
            ?? $this->privacySetting?->email_notifications_enabled
            ?? true;
    }

    /**
     * Verificar si el usuario completó el onboarding.
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    /**
     * Canal privado de broadcasting para notificaciones de este usuario.
     */
    public function routeNotificationForBroadcast($notification): string
    {
        return 'user.' . $this->id;
    }

    /**
     * Broadcast notification channel for this user.
     */
    public function receivesBroadcastNotificationsOn($notification): string
    {
        return 'user.' . $this->id;
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->slug)) {
                $baseSlug = static::generateSlug($user->name);
                $slug = $baseSlug;
                $counter = 1;

                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }

                $user->slug = $slug;
            }
        });
    }

    /**
     * Generate a URL-friendly slug from a name, removing accents and special chars.
     */
    private static function generateSlug(string $name): string
    {
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name);
        $normalized = str_replace(["'", '"', '`'], '', $normalized);
        $normalized = preg_replace('/[^a-z0-9]+/i', '-', $normalized);
        $normalized = trim($normalized, '-');
        $normalized = strtolower($normalized);

        return $normalized ?: 'user';
    }
}
