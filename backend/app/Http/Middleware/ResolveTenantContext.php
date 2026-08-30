<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Models\TenantClientOrganization;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantContext
{
    /**
     * Handle an incoming request and resolve active tenant context.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $requestedTenantId = $request->header('X-Tenant-ID') 
            ?: $request->query('tenant_id') 
            ?: ($user ? $user->tenant_id : null);

        if (!$requestedTenantId) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant context missing. Please provide X-Tenant-ID header.'
            ], 400);
        }

        $tenant = Tenant::where('id', $requestedTenantId)->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or inactive tenant.'
            ], 404);
        }

        // If user is authenticated, ensure they have access to this tenant
        if ($user) {
            if ($user->role === 'super_admin') {
                // Super admin has global access to all tenants
            } elseif ($user->tenant_id === $tenant->id) {
                // Direct tenant member
            } else {
                // Check if user's tenant is a DPO or DPCO firm managing this client tenant
                $hasClientRelationship = TenantClientOrganization::where('parent_tenant_id', $user->tenant_id)
                    ->where('client_tenant_id', $tenant->id)
                    ->where('status', 'active')
                    ->exists();

                if (!$hasClientRelationship) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized tenant access. You do not have an active engagement with this organization.'
                    ], 403);
                }
            }
        }

        // Bind resolved tenant to Laravel container
        app()->instance('current_tenant_id', $tenant->id);
        app()->instance('current_tenant', $tenant);

        return $next($request);
    }
}
