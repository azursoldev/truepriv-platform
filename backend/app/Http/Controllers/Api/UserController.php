<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * List all users within the current tenant context.
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->user()->tenant_id;
        $currentUser = $request->user();

        $query = User::query();

        if ($tenantId && !$currentUser->isSuperAdmin()) {
            $query->where('tenant_id', $tenantId);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }

        if ($request->filled('department')) {
            $query->where('department', $request->query('department'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        $summary = [
            'total_users' => $users->count(),
            'active_users' => $users->where('is_active', true)->count(),
            'admins' => $users->whereIn('role', ['super_admin', 'corporate_admin'])->count(),
            'champions' => $users->where('role', 'dept_champion')->count(),
            'compliance_officers' => $users->where('role', 'compliance_officer')->count(),
            'seat_capacity' => 25,
        ];

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'data' => $users,
        ]);
    }

    /**
     * Invite / Create a new user in the organization.
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|string|in:corporate_admin,compliance_officer,dept_champion,auditor_viewer,dpco_lead_auditor,dpco_staff,outsourced_dpo,super_admin',
            'department' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:8',
        ]);

        $user = User::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'Password123!'),
            'role' => $validated['role'],
            'department' => $validated['department'] ?? 'Compliance',
            'phone' => $validated['phone'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} successfully provisioned with role {$user->role}.",
            'data' => $user,
        ], 201);
    }

    /**
     * Update an existing user's role, department, or active status.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->user()->tenant_id;
        $currentUser = $request->user();

        $query = User::query();
        if (!$currentUser->isSuperAdmin()) {
            $query->where('tenant_id', $tenantId);
        }

        $user = $query->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|string|in:corporate_admin,compliance_officer,dept_champion,auditor_viewer,dpco_lead_auditor,dpco_staff,outsourced_dpo,super_admin',
            'department' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:30',
            'is_active' => 'sometimes|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['password']) && !empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} updated successfully.",
            'data' => $user,
        ]);
    }

    /**
     * Remove / Deprovision a user from the workspace.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->user()->tenant_id;
        $currentUser = $request->user();

        if ($currentUser->id === $id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deprovision your own administrative account.',
            ], 422);
        }

        $query = User::query();
        if (!$currentUser->isSuperAdmin()) {
            $query->where('tenant_id', $tenantId);
        }

        $user = $query->where('id', $id)->firstOrFail();
        $userName = $user->name;
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "User {$userName} has been removed from the organization workspace.",
        ]);
    }

    /**
     * Return the official 8-Role NDPA Permission Matrix.
     */
    public function getPermissionsMatrix(): JsonResponse
    {
        $matrix = [
            [
                'role' => 'super_admin',
                'title' => 'System Super Administrator',
                'category' => 'Global Governance',
                'description' => 'Global multi-tenant governance, industry template management, and audit licensing.',
                'permissions' => [
                    'manage_all_tenants' => true,
                    'edit_industry_templates' => true,
                    'certify_dpco_audits' => true,
                    'manage_users_roles' => true,
                    'declare_breaches' => true,
                    'view_financial_ledgers' => true,
                ]
            ],
            [
                'role' => 'corporate_admin',
                'title' => 'Corporate Organization Admin',
                'category' => 'Enterprise Controller',
                'description' => 'Full administrative access to corporate workspace, team members, and compliance records.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => false,
                    'manage_users_roles' => true,
                    'declare_breaches' => true,
                    'view_financial_ledgers' => true,
                ]
            ],
            [
                'role' => 'compliance_officer',
                'title' => 'Internal DPO / Compliance Officer',
                'category' => 'Operational Compliance',
                'description' => 'Manages day-to-day RoPA records, conducts DPIAs, responds to DSARs, and monitors vendor DPAs.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => false,
                    'manage_users_roles' => false,
                    'declare_breaches' => true,
                    'view_financial_ledgers' => false,
                ]
            ],
            [
                'role' => 'dept_champion',
                'title' => 'Department Champion (HR / IT / Finance)',
                'category' => 'Business Unit Contributor',
                'description' => 'Scoped access to log department-specific processing activities and vendor flows.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => false,
                    'manage_users_roles' => false,
                    'declare_breaches' => false,
                    'view_financial_ledgers' => false,
                ]
            ],
            [
                'role' => 'dpco_lead_auditor',
                'title' => 'DPCO Lead Audit Partner',
                'category' => 'Licensed DPCO Firm',
                'description' => 'Conducts annual GAID statutory audit fieldwork, scores compliance checklists, and issues certified NDPC filing packs.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => true,
                    'manage_users_roles' => false,
                    'declare_breaches' => true,
                    'view_financial_ledgers' => false,
                ]
            ],
            [
                'role' => 'dpco_staff',
                'title' => 'DPCO Audit Field Staff',
                'category' => 'Licensed DPCO Firm',
                'description' => 'Assists lead auditor with evidence verification and checklist item scoring.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => false,
                    'manage_users_roles' => false,
                    'declare_breaches' => false,
                    'view_financial_ledgers' => false,
                ]
            ],
            [
                'role' => 'outsourced_dpo',
                'title' => 'Outsourced DPO Consultant',
                'category' => 'Advisory Practice',
                'description' => 'Multi-client portfolio access to draft RoPA and DPIAs across retained client organizations.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => false,
                    'manage_users_roles' => false,
                    'declare_breaches' => true,
                    'view_financial_ledgers' => false,
                ]
            ],
            [
                'role' => 'auditor_viewer',
                'title' => 'External Regulator / Board Auditor',
                'category' => 'Read-Only Assurance',
                'description' => 'Read-only access to compliance readiness scorecard, verified RoPA, and statutory returns.',
                'permissions' => [
                    'manage_all_tenants' => false,
                    'edit_industry_templates' => false,
                    'certify_dpco_audits' => false,
                    'manage_users_roles' => false,
                    'declare_breaches' => false,
                    'view_financial_ledgers' => false,
                ]
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $matrix,
        ]);
    }
}
