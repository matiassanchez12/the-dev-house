<?php

use Illuminate\Support\Facades\Broadcast;
use App\Broadcasting\ProjectChannel;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/**
 * Canal de proyecto para el chat
 * Solo acceden: creator y participantes aprobados
 */
Broadcast::channel('project.{projectId}', ProjectChannel::class);
