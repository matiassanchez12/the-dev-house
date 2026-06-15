<?php

return [
    'testing' => [
        'ensure_pages_exist' => true,

        'page_extensions' => [
            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',
        ],

        'page_paths' => [
            resource_path('js/pages'),
        ],
    ],
];
