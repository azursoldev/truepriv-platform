<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocalizationController extends Controller
{
    /**
     * Get active tenant data localization and residency status.
     */
    public function getStatus(): JsonResponse
    {
        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $isLocal = ($tenant->data_residency === 'local_galaxy_backbone' || $tenant->data_residency === 'local_onshore');

        return response()->json([
            'success' => true,
            'data' => [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'data_residency' => $tenant->data_residency,
                'residency_label' => $isLocal ? '🇳🇬 Local Onshore (Galaxy Backbone / MainOne)' : '☁️ Global Cloud (AWS eu-west-1)',
                'is_onshore' => $isLocal,
                'ndpa_section_20_compliant' => true,
                'encryption_standard' => 'AES-256 at Rest / TLS 1.3 in Transit',
                'sovereignty_tier' => $isLocal ? 'Sovereign Tier 1 (Strict Nigerian Onshore)' : 'Standard Enterprise Tier 2',
                'backup_location' => $isLocal ? 'Abuja Tier-III / Lagos DC' : 'Ireland / Frankfurt',
            ],
        ]);
    }

    /**
     * Switch data residency localization preference.
     */
    public function switchResidency(Request $request): JsonResponse
    {
        $request->validate([
            'data_residency' => 'required|in:local_galaxy_backbone,global_aws,local_onshore',
        ]);

        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $tenant->update([
            'data_residency' => $request->data_residency,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data residency updated to {$request->data_residency}.",
            'data' => $tenant,
        ]);
    }
}
