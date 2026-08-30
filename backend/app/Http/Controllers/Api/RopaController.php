<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndustryTemplate;
use App\Models\RopaActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RopaController extends Controller
{
    /**
     * List all RoPA activities for active tenant with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RopaActivity::with('reviewer');

        if ($request->has('department') && $request->department) {
            $query->where('department', $request->department);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('legal_basis') && $request->legal_basis) {
            $query->where('legal_basis', $request->legal_basis);
        }

        if ($request->has('search') && $request->search) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('process_name', 'like', $term)
                  ->orWhere('business_purpose', 'like', $term);
            });
        }

        $activities = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $activities->count(),
            'data' => $activities,
        ]);
    }

    /**
     * 1-Click "Apply Industry Template" — Instant RoPA generation.
     */
    public function applyIndustryTemplate(Request $request): JsonResponse
    {
        $request->validate([
            'industry_slug' => 'required|string',
            'overwrite' => 'boolean',
        ]);

        $template = IndustryTemplate::where('slug', $request->industry_slug)->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Industry template not found.'
            ], 404);
        }

        $tenantId = app('current_tenant_id');

        if ($request->overwrite) {
            RopaActivity::where('tenant_id', $tenantId)->delete();
        }

        $createdCount = 0;
        foreach ($template->default_ropa as $item) {
            // Avoid duplicate process name if not overwriting
            if (!$request->overwrite && RopaActivity::where('process_name', $item['process_name'])->exists()) {
                continue;
            }

            RopaActivity::create([
                'tenant_id' => $tenantId,
                'process_name' => $item['process_name'],
                'department' => $item['department'],
                'business_purpose' => $item['business_purpose'],
                'legal_basis' => $item['legal_basis'],
                'legal_basis_rationale' => $item['legal_basis_rationale'] ?? null,
                'data_subject_categories' => $item['data_subject_categories'],
                'personal_data_elements' => $item['personal_data_elements'],
                'special_category_data' => $item['special_category_data'] ?? false,
                'recipients' => $item['recipients'] ?? [],
                'has_third_party_processor' => $item['has_third_party_processor'] ?? false,
                'third_party_names' => $item['third_party_names'] ?? [],
                'cross_border_transfer' => $item['cross_border_transfer'] ?? false,
                'transfer_destination_countries' => $item['transfer_destination_countries'] ?? [],
                'transfer_safeguards' => $item['transfer_safeguards'] ?? null,
                'storage_location' => $item['storage_location'] ?? 'Local Server / Cloud',
                'retention_period' => $item['retention_period'] ?? '6 years',
                'security_measures' => $item['security_measures'] ?? 'AES-256 encryption, TLS 1.3, Access controls',
                'requires_dpia' => $item['requires_dpia'] ?? false,
                'status' => 'draft',
            ]);
            $createdCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully populated {$createdCount} processing activities from the {$template->industry_name} preset.",
            'created_count' => $createdCount,
        ]);
    }

    /**
     * Create a single new RoPA activity manually.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'process_name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'business_purpose' => 'required|string',
            'legal_basis' => 'required|in:consent,contract,legal_obligation,vital_interest,public_interest,legitimate_interest',
            'legal_basis_rationale' => 'nullable|string',
            'data_subject_categories' => 'required|array',
            'personal_data_elements' => 'required|array',
            'special_category_data' => 'boolean',
            'recipients' => 'nullable|array',
            'has_third_party_processor' => 'boolean',
            'third_party_names' => 'nullable|array',
            'cross_border_transfer' => 'boolean',
            'transfer_destination_countries' => 'nullable|array',
            'transfer_safeguards' => 'nullable|in:adequacy_decision,ndpc_approved_bcr,standard_contractual_clauses,explicit_consent,none',
            'storage_location' => 'required|string',
            'retention_period' => 'required|string',
            'security_measures' => 'nullable|string',
            'requires_dpia' => 'boolean',
        ]);

        $validated['status'] = 'draft';
        $activity = RopaActivity::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Processing activity created.',
            'data' => $activity,
        ], 201);
    }

    /**
     * Update an existing RoPA activity.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $activity = RopaActivity::findOrFail($id);

        $validated = $request->validate([
            'process_name' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
            'business_purpose' => 'sometimes|string',
            'legal_basis' => 'sometimes|in:consent,contract,legal_obligation,vital_interest,public_interest,legitimate_interest',
            'legal_basis_rationale' => 'nullable|string',
            'data_subject_categories' => 'sometimes|array',
            'personal_data_elements' => 'sometimes|array',
            'special_category_data' => 'boolean',
            'recipients' => 'nullable|array',
            'has_third_party_processor' => 'boolean',
            'third_party_names' => 'nullable|array',
            'cross_border_transfer' => 'boolean',
            'transfer_destination_countries' => 'nullable|array',
            'transfer_safeguards' => 'nullable|in:adequacy_decision,ndpc_approved_bcr,standard_contractual_clauses,explicit_consent,none',
            'storage_location' => 'sometimes|string',
            'retention_period' => 'sometimes|string',
            'security_measures' => 'nullable|string',
            'requires_dpia' => 'boolean',
        ]);

        $activity->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Processing activity updated.',
            'data' => $activity,
        ]);
    }

    /**
     * Workflow: Department Review -> DPO Verify -> Executive Approve.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:draft,reviewed_by_dept,verified_by_dpo,approved_active',
        ]);

        $activity = RopaActivity::findOrFail($id);
        $user = $request->user();

        $activity->status = $request->status;
        $activity->reviewed_by = $user->id;
        if ($request->status === 'approved_active') {
            $activity->approved_at = now();
        }
        $activity->save();

        return response()->json([
            'success' => true,
            'message' => "RoPA activity transitioned to '{$request->status}' status.",
            'data' => $activity,
        ]);
    }

    /**
     * Delete RoPA activity.
     */
    public function destroy(string $id): JsonResponse
    {
        $activity = RopaActivity::findOrFail($id);
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Processing activity deleted successfully.'
        ]);
    }
}
