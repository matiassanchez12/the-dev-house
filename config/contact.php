<?php

return [
    'feedback_recipient' => [
        'enabled' => env('CONTACT_FEEDBACK_RECIPIENT_ENABLED', false),
        'address' => env('CONTACT_FEEDBACK_RECIPIENT_ADDRESS', 'matias.sanchez.0097@gmail.com'),
        'name' => env('CONTACT_FEEDBACK_RECIPIENT_NAME', 'Matias Sanchez'),
    ],
];
