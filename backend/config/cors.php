<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers and mobile apps.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'embeds/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*', 'X-Tenant-ID', 'Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => ['*'],

    'max_age' => 86400,

    'supports_credentials' => false,

];
