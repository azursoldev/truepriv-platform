<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Dual-Residency Feature Flag
    |--------------------------------------------------------------------------
    |
    | When set to false, all tenant operations run 100% on the primary onshore
    | Nigerian infrastructure (Galaxy Backbone / MainOne) and global storage UI is hidden.
    | When enabled (true), dynamic multi-region routing allows clients to select
    | either Nigerian onshore or Global AWS offshore infrastructure.
    |
    */
    'enabled' => filter_var(env('DUAL_RESIDENCY_ENABLED', false), FILTER_VALIDATE_BOOLEAN),

    'default_residency' => 'local_nigeria',

    'regions' => [
        'local_nigeria' => [
            'id' => 'local_nigeria',
            'name' => 'Primary Nigerian Onshore Cloud',
            'provider' => 'Galaxy Backbone / MainOne Datacenter',
            'location' => 'Lagos / Abuja, Nigeria',
            'ndpa_section_20_compliance' => 'Full Onshore Localization',
            'connection' => 'local_nigeria',
        ],
        'global_aws' => [
            'id' => 'global_aws',
            'name' => 'Global Cloud Infrastructure',
            'provider' => 'Amazon Web Services (AWS)',
            'location' => 'eu-west-1 (Dublin, Ireland)',
            'ndpa_section_20_compliance' => 'Cross-Border Safeguards Required',
            'connection' => 'global_aws',
        ],
    ],
];
