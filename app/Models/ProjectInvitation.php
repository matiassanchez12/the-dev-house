<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ProjectInvitation extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'cancelled_at',
        'invited_user_id',
        'message',
        'project_id',
        'responded_at',
        'status',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    /**
     * The project that owns this invitation.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * The user who received this invitation.
     */
    public function invitedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_user_id');
    }

    protected static function booted(): void
    {
        static::saving(function (ProjectInvitation $invitation): void {
            if ($invitation->status === null || $invitation->status === '') {
                $invitation->status = self::STATUS_PENDING;
            }

            $invitation->pending_invitation_key = $invitation->status === self::STATUS_PENDING
                ? $invitation->invited_user_id
                : null;
        });
    }
}
