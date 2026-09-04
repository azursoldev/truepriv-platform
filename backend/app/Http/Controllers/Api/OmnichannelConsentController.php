<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessOmnichannelConsent;
use App\Models\OmnichannelConsent;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OmnichannelConsentController extends Controller
{
    /**
     * Ingest High-Velocity Omnichannel Consent (USSD, SMS, Web SDK, Mobile App).
     * Asynchronously dispatches to background queue pool to handle telecom/gateway burst traffic.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'nullable|uuid',
            'data_subject_identifier' => 'required|string|max:255',
            'channel' => 'required|in:ussd_session,sms_shortcode,web_sdk,mobile_app,physical_paper_form,ivr_voice_prompt',
            'channel_session_ref' => 'nullable|string|max:255',
            'consent_categories' => 'required|array',
            'raw_payload' => 'nullable|array',
            'ip_address' => 'nullable|string|max:45',
        ]);

        $tenantId = $validated['tenant_id'] ?? app('current_tenant_id') ?? $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant context required.'], 400);
        }

        // Pass client IP if not explicitly given
        if (empty($validated['ip_address'])) {
            $validated['ip_address'] = $request->ip();
        }

        // Dispatch to asynchronous background Queue worker pool
        ProcessOmnichannelConsent::dispatch($validated, $tenantId);

        return response()->json([
            'success' => true,
            'status' => 'queued',
            'message' => 'Omnichannel consent proof queued asynchronously for ledger ingestion.',
            'channel' => $validated['channel'],
            'identifier' => $validated['data_subject_identifier'],
            'queued_at' => now()->toIso8601String(),
        ], 202);
    }

    /**
     * List all recorded omnichannel consents for active tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OmnichannelConsent::where('tenant_id', app('current_tenant_id'));

        if ($request->has('channel') && $request->channel !== 'all') {
            $query->where('channel', $request->channel);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where('data_subject_identifier', 'like', '%' . $request->search . '%');
        }

        $consents = $query->orderBy('opt_in_timestamp', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $consents,
        ]);
    }

    /**
     * Withdraw a data subject's omnichannel consent.
     */
    public function withdraw(Request $request, string $id): JsonResponse
    {
        $consent = OmnichannelConsent::where('tenant_id', app('current_tenant_id'))->findOrFail($id);

        $consent->update([
            'is_withdrawn' => true,
            'withdrawn_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Consent successfully marked as withdrawn.',
            'data' => $consent,
        ]);
    }

    /**
     * Public Cryptographic Proof Verification Endpoint.
     */
    public function verifyProof(string $proofHash): JsonResponse
    {
        $consent = OmnichannelConsent::where('proof_hash', $proofHash)->first();

        if (!$consent) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Cryptographic consent proof not found on ledger.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'valid' => true,
            'proof_hash' => $consent->proof_hash,
            'channel' => $consent->channel,
            'opt_in_timestamp' => $consent->opt_in_timestamp->toIso8601String(),
            'is_withdrawn' => $consent->is_withdrawn,
            'withdrawn_at' => $consent->withdrawn_at ? $consent->withdrawn_at->toIso8601String() : null,
            'consent_categories' => $consent->consent_categories,
        ]);
    }
}
