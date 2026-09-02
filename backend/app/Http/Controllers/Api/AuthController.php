<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndustryTemplate;
use App\Models\RopaActivity;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\TenantClientOrganization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user and return token, tenant profile, and accessible workspaces.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('tenant')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password credentials.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is deactivated. Please contact your administrator.'
            ], 403);
        }

        // Fetch accessible client organizations if user is an Outsourced DPO or DPCO firm
        $accessibleClients = [];
        if ($user->tenant && in_array($user->tenant->type, ['outsourced_dpo', 'dpco_firm'])) {
            $engagements = TenantClientOrganization::with('clientTenant')
                ->where('parent_tenant_id', $user->tenant_id)
                ->where('status', 'active')
                ->get();

            $accessibleClients = $engagements->map(function ($eng) {
                return [
                    'engagement_id' => $eng->id,
                    'client_id' => $eng->client_tenant_id,
                    'name' => $eng->clientTenant->name,
                    'slug' => $eng->clientTenant->slug,
                    'industry' => $eng->clientTenant->industry,
                    'compliance_score' => $eng->clientTenant->compliance_score,
                    'service_scope' => $eng->service_scope,
                ];
            });
        }

        // Enforce 12-hour absolute token expiration
        $token = $user->createToken('auth-token', ['*'], now()->addHours(12))->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'phone' => $user->phone,
            ],
            'tenant' => $user->tenant ? [
                'id' => $user->tenant->id,
                'name' => $user->tenant->name,
                'slug' => $user->tenant->slug,
                'type' => $user->tenant->type,
                'industry' => $user->tenant->industry,
                'rc_number' => $user->tenant->rc_number,
                'ndpc_registration_number' => $user->tenant->ndpc_registration_number,
                'compliance_score' => $user->tenant->compliance_score,
            ] : null,
            'accessible_clients' => $accessibleClients,
        ]);
    }

    /**
     * Register a new corporate tenant with 1-click industry template automation.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'organization_name' => 'nullable|string|max:255',
            'tenant_type' => 'required|in:corporate,outsourced_dpo,dpco_firm',
            'industry_slug' => 'nullable|string',
            'rc_number' => 'nullable|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'state' => 'nullable|string',
            'auto_populate_ropa' => 'boolean',
        ]);

        $orgName = $request->organization_name;
        if (!$orgName) {
            $domain = substr(strrchr($request->email, "@"), 1);
            $domainName = explode('.', $domain)[0];
            $orgName = ucwords(str_replace(['-', '_'], ' ', $domainName)) . ' Organization';
        }

        $tenantSlug = Str::slug($orgName);
        if (Tenant::where('slug', $tenantSlug)->exists()) {
            $tenantSlug .= '-' . Str::random(4);
        }

        $industryName = null;
        $industryTemplate = null;
        if ($request->industry_slug) {
            $industryTemplate = IndustryTemplate::where('slug', $request->industry_slug)->first();
            if ($industryTemplate) {
                $industryName = $industryTemplate->industry_name;
            }
        }

        $residencyService = app(\App\Services\DataResidencyService::class);
        $resolvedResidency = $residencyService->resolveTenantResidency($request->data_residency);

        $tenant = Tenant::create([
            'name' => $orgName,
            'slug' => $tenantSlug,
            'type' => $request->tenant_type,
            'industry' => $industryName ?? 'Corporate Compliance',
            'rc_number' => $request->rc_number,
            'state' => $request->state ?? 'Lagos',
            'data_residency' => $resolvedResidency,
            'compliance_score' => 20.00,
            'is_active' => true,
        ]);

        $userRole = match ($request->tenant_type) {
            'outsourced_dpo' => 'outsourced_dpo',
            'dpco_firm' => 'dpco_lead_auditor',
            default => 'corporate_admin',
        };

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $userRole,
            'department' => 'Compliance & Risk',
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        // Auto-populate RoPA if selected and template exists
        if ($request->auto_populate_ropa && $industryTemplate && !empty($industryTemplate->default_ropa)) {
            foreach ($industryTemplate->default_ropa as $ropa) {
                RopaActivity::create([
                    'tenant_id' => $tenant->id,
                    'process_name' => $ropa['process_name'],
                    'department' => $ropa['department'],
                    'business_purpose' => $ropa['business_purpose'],
                    'legal_basis' => $ropa['legal_basis'],
                    'legal_basis_rationale' => $ropa['legal_basis_rationale'] ?? null,
                    'data_subject_categories' => $ropa['data_subject_categories'],
                    'personal_data_elements' => $ropa['personal_data_elements'],
                    'special_category_data' => $ropa['special_category_data'] ?? false,
                    'recipients' => $ropa['recipients'] ?? [],
                    'has_third_party_processor' => $ropa['has_third_party_processor'] ?? false,
                    'third_party_names' => $ropa['third_party_names'] ?? [],
                    'cross_border_transfer' => $ropa['cross_border_transfer'] ?? false,
                    'transfer_destination_countries' => $ropa['transfer_destination_countries'] ?? [],
                    'transfer_safeguards' => $ropa['transfer_safeguards'] ?? null,
                    'storage_location' => $ropa['storage_location'] ?? 'Local Server / Cloud',
                    'retention_period' => $ropa['retention_period'] ?? '6 years',
                    'security_measures' => $ropa['security_measures'] ?? 'AES-256 encryption, TLS 1.3, Access controls',
                    'requires_dpia' => $ropa['requires_dpia'] ?? false,
                    'status' => 'draft',
                ]);
            }
        }

        // Create default onboarding trial subscription
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => match ($request->tenant_type) {
                'dpco_firm' => 'dpco_audit_suite',
                'outsourced_dpo' => 'dpo_unlimited',
                default => 'starter_corporate',
            },
            'billing_cycle' => 'annual',
            'price_ngn' => 0.00,
            'status' => 'trialing',
            'current_period_start' => now(),
            'current_period_end' => now()->addDays(14),
        ]);

        // Enforce 12-hour absolute token expiration
        $token = $user->createToken('auth-token', ['*'], now()->addHours(12))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Organization registered successfully with automated compliance scaffolding.',
            'token' => $token,
            'user' => $user,
            'tenant' => $tenant,
        ], 201);
    }

    /**
     * Get authenticated user profile & tenant info.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant');
        $activeTenant = app()->bound('current_tenant') ? app('current_tenant') : $user->tenant;

        return response()->json([
            'success' => true,
            'user' => $user,
            'tenant' => $activeTenant,
        ]);
    }

    /**
     * Revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Get active platform feature flags (e.g. Dual-Residency multi-region routing).
     */
    public function getFeatures(\App\Services\DataResidencyService $residencyService): JsonResponse
    {
        return response()->json([
            'success' => true,
            'features' => $residencyService->getResidencyFeatureMetadata(),
        ]);
    }
}
