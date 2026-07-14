<?php

namespace App\Models;

use Database\Factories\UserPrivacySettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-user privacy preferences controlling which profile fields are exposed
 * publicly. Created lazily on first read; defaults are privacy-first.
 *
 * @property int $id
 * @property int $user_id
 * @property bool $show_email
 * @property bool $show_phone
 * @property bool $is_discoverable
 * @property bool $show_activity
 * @property bool $email_notifications_enabled
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class UserPrivacySetting extends Model
{
    /** @use HasFactory<UserPrivacySettingFactory> */
    use HasFactory;

    /**
     * Privacy-first defaults: sensitive data is OFF by default.
     * Discovery and activity are ON by default so new accounts are visible.
     */
    public const DEFAULTS = [
        'show_email' => false,
        'show_phone' => false,
        'is_discoverable' => true,
        'show_activity' => true,
        'email_notifications_enabled' => true,
    ];

    protected $table = 'user_privacy_settings';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'is_discoverable',
        'show_activity',
        'show_email',
        'show_phone',
        'email_notifications_enabled',
        'user_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_discoverable' => 'boolean',
            'show_activity' => 'boolean',
            'show_email' => 'boolean',
            'show_phone' => 'boolean',
            'email_notifications_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
