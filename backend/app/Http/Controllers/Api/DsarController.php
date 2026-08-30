<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DsarRequest;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DsarController extends Controller
{
    /**
     * List all DSAR requests for active tenant with remaining SLA days.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DsarRequest::with('assignedDpo');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('request_type') && $request->request_type) {
            $query->where('request_type', $request->request_type);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        $data = $requests->map(function ($dsar) {
            return array_merge($dsar->toArray(), [
                'days_remaining' => $dsar->days_remaining,
                'is_urgent' => $dsar->days_remaining <= 7 && !in_array($dsar->status, ['completed', 'rejected']),
            ]);
        });

        return response()->json([
            'success' => true,
            'count' => $data->count(),
            'data' => $data,
        ]);
    }

    /**
     * Public Self-Service Intake Endpoint for data subjects (/api/v1/public/dsar/submit).
     */
    public function publicSubmit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_slug' => 'required|string',
            'request_type' => 'required|in:access_copy,rectification,erasure,objection,restrict_processing,data_portability',
            'data_subject_name' => 'required|string|max:255',
            'data_subject_email' => 'required|email|max:255',
            'data_subject_phone' => 'nullable|string',
            'subject_relationship' => 'required|in:customer,former_customer,employee,job_applicant,vendor_contact,other',
            'request_details' => 'required|string',
            'id_document' => 'nullable|file|max:10240', // 10MB max
        ]);

        $tenant = Tenant::where('slug', $validated['tenant_slug'])->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid organization slug.'
            ], 404);
        }

        $idPath = null;
        if ($request->hasFile('id_document')) {
            $file = $request->file('id_document');
            $idPath = $file->storeAs("tenants/{$tenant->id}/dsar_ids", Str::random(20) . '.' . $file->getClientOriginalExtension(), 'local');
        }

        $ticketNumber = 'DSAR-' . date('Y') . '-' . strtoupper(Str::random(6));

        $dsar = DsarRequest::create([
            'tenant_id' => $tenant->id,
            'ticket_number' => $ticketNumber,
            'request_type' => $validated['request_type'],
            'data_subject_name' => $validated['data_subject_name'],
            'data_subject_email' => $validated['data_subject_email'],
            'data_subject_phone' => $validated['data_subject_phone'] ?? null,
            'subject_relationship' => $validated['subject_relationship'],
            'request_details' => $validated['request_details'],
            'id_document_path' => $idPath,
            'id_verified' => false,
            'sla_deadline' => now()->addDays(30), // Statutory 30-day clock under NDPA Sec 34
            'status' => 'submitted',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data Subject Access Request submitted successfully under the Nigeria Data Protection Act (NDPA 2023).',
            'ticket_number' => $ticketNumber,
            'sla_deadline' => $dsar->sla_deadline->toIso8601String(),
            'statutory_timeline' => '30 calendar days',
        ], 201);
    }

    /**
     * Update DSAR status, verify identity, and generate legal response.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $dsar = DsarRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:submitted,identity_verified,investigating,action_taken,completed,rejected',
            'id_verified' => 'boolean',
            'response_summary' => 'nullable|string',
            'rejection_reason' => 'nullable|string',
            'assigned_dpo_id' => 'nullable|exists:users,id',
        ]);

        if ($request->status === 'completed' || $request->status === 'rejected') {
            $dsar->completed_at = now();
        }

        $dsar->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'DSAR status updated.',
            'data' => $dsar,
        ]);
    }
}
