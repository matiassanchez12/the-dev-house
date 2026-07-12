<?php

namespace App\Services;

use App\Mail\ContactFeedbackSubmitted;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Mail;

class ContactService
{
    public function store(array $data): ContactMessage
    {
        $contactMessage = ContactMessage::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'satisfaction' => $data['satisfaction'],
            'understood_purpose' => $data['understood_purpose'],
            'would_join_project' => $data['would_join_project'],
            'missing_feature' => $data['missing_feature'],
            'tech_stack' => $data['tech_stack'],
            'preferred_project_type' => $data['preferred_project_type'],
            'improvements' => $data['improvements'],
        ]);

        if (config('contact.feedback_recipient.enabled')) {
            Mail::to(
                config('contact.feedback_recipient.address'),
                config('contact.feedback_recipient.name'),
            )->send(new ContactFeedbackSubmitted($contactMessage));
        }

        return $contactMessage;
    }
}
