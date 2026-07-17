<?php

namespace App\Models;

use Database\Factories\UserNotificationSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-user notification preferences for optional collaboration emails.
 *
 * @property int $id
 * @property int $user_id
 * @property bool $collaboration_emails
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class UserNotificationSetting extends Model
{
    /** @use HasFactory<UserNotificationSettingFactory> */
    use HasFactory;

    public const DEFAULTS = [
        'collaboration_emails' => true,
    ];

    protected $table = 'user_notification_settings';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'collaboration_emails',
        'user_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'collaboration_emails' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
