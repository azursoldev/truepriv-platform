<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class DataResidencyService
{
    /**
     * Check if Dual-Residency multi-region capability is actively enabled via feature flag.
     */
    public function isDualResidencyEnabled(): bool
    {
        return (bool) Config::get('residency.enabled', false);
    }

    /**
     * Resolve effective data residency destination for a new tenant onboarding.
     * When the feature flag is disabled, all tenants are strictly routed to the onshore Nigerian connection.
     */
    public function resolveTenantResidency(?string $requestedResidency = null): string
    {
        // 1. If feature flag is inactive, force 100% onshore Nigerian residency
        if (!$this->isDualResidencyEnabled()) {
            return Config::get('residency.default_residency', 'local_nigeria');
        }

        // 2. If feature flag is active, allow requested region if supported
        $supportedRegions = array_keys(Config::get('residency.regions', []));
        if ($requestedResidency && in_array($requestedResidency, $supportedRegions, true)) {
            return $requestedResidency;
        }

        return Config::get('residency.default_residency', 'local_nigeria');
    }

    /**
     * Get active database connection name for a specific tenant.
     */
    public function getConnectionForTenant(Tenant $tenant): string
    {
        return $tenant->getDatabaseConnection();
    }

    /**
     * Retrieve public feature metadata for frontend onboarding/portal presentation.
     */
    public function getResidencyFeatureMetadata(): array
    {
        $enabled = $this->isDualResidencyEnabled();
        $regions = Config::get('residency.regions', []);

        return [
            'dual_residency_enabled' => $enabled,
            'default_residency' => Config::get('residency.default_residency', 'local_nigeria'),
            'available_regions' => $regions,
            'active_strategy' => $enabled
                ? 'Dynamic Multi-Region Routing (Nigeria Onshore + AWS Offshore)'
                : 'Streamlined Single Onshore (100% Local Nigerian Infrastructure)',
        ];
    }
}
