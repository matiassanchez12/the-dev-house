<?php

use Illuminate\Support\Facades\Broadcast;
use App\Broadcasting\ProjectChannel;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/**
 * Canal de proyecto para el chat
 * Solo acceden: creator, participantes aprobados, y solicitantes pendientes
 */
Broadcast::channel('project.{projectId}', ProjectChannel::class);
