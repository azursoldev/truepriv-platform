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

        $residency = $tenant->data_residency ?? 'local_nigeria';
        $isLocal = in_array($residency, ['local_nigeria', 'local_galaxy_backbone', 'local_onshore']);

        return response()->json([
            'success' => true,
            'data' => [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'data_residency' => $residency,
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
            'data_residency' => 'required|string',
        ]);

        $inputResidency = $request->data_residency;
        // Normalize alias names to DB schema enum ('local_nigeria' or 'global_aws')
        $dbResidency = in_array($inputResidency, ['local_galaxy_backbone', 'local_onshore', 'local_nigeria'])
            ? 'local_nigeria'
            : 'global_aws';

        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $tenant->update([
            'data_residency' => $dbResidency,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data residency updated to {$dbResidency}.",
            'data' => [
                'id' => $tenant->id,
                'data_residency' => $dbResidency,
                'is_onshore' => ($dbResidency === 'local_nigeria'),
            ],
        ]);
    }
}
