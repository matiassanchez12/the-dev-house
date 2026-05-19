<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'body',
        'type',
        'file_url',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Proyecto del mensaje
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Usuario que envió el mensaje
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
