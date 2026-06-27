<?php

return [
    'feedback_recipient' => [
        'address' => env('CONTACT_FEEDBACK_RECIPIENT_ADDRESS', 'test@example.com'),
        'name' => env('CONTACT_FEEDBACK_RECIPIENT_NAME', 'Test Recipient'),
    ],
];
