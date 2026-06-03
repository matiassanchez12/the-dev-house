<?php

namespace App\Services;

use App\Models\ContactMessage;

class ContactService
{
    public function store(array $data): ContactMessage
    {
        return ContactMessage::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'reason' => $data['reason'],
            'message' => $data['message'],
        ]);
    }
}
