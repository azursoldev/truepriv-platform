<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * List all third-party data processors with DPA status and risk ratings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Vendor::query();

        if ($request->has('dpa_signed')) {
            $query->where('dpa_signed', filter_var($request->dpa_signed, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('risk_rating') && $request->risk_rating) {
            $query->where('risk_rating', $request->risk_rating);
        }

        if ($request->has('cookie_category') && $request->cookie_category) {
            $query->where('cookie_category', $request->cookie_category);
        }

        $vendors = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $vendors->count(),
            'data' => $vendors,
        ]);
    }

    /**
     * Create new vendor processor record.
     */
    public function store(Request $request): JsonResponse
    {
        $tenant = app()->bound('current_tenant') ? app('current_tenant') : $request->user()->tenant;

        if ($tenant) {
            $hasPaidActivePlan = $tenant->subscriptions()
                ->where('status', 'active')
                ->whereIn('plan_tier', ['growth_enterprise', 'dpo_unlimited', 'dpco_audit_suite'])
                ->exists();

            if (!$hasPaidActivePlan) {
                $vendorCount = Vendor::count();
                if ($vendorCount >= 3) {
                    return response()->json([
                        'success' => false,
                        'error' => 'trial_quota_exceeded',
                        'message' => 'Starter Trial is restricted to a maximum of 3 third-party processors. Please upgrade your plan to register additional vendors.',
                        'upgrade_required' => true,
                    ], 403);
                }
            }
        }

        $validated = $request->validate([
            'vendor_name' => 'required|string|max:255',
            'service_category' => 'required|string|max:255',
            'cookie_category' => 'nullable|string|in:strictly_necessary,functional,analytics,marketing,none',
            'cookies_detected' => 'nullable|array',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string',
            'data_types_processed' => 'required|array',
            'dpa_signed' => 'boolean',
            'dpa_signed_date' => 'nullable|date',
            'risk_rating' => 'required|in:low,medium,high,critical',
            'hosting_country' => 'nullable|string',
            'is_cross_border' => 'boolean',
            'status' => 'in:active,under_review,terminated',
        ]);

        $vendor = Vendor::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Third-party processor registered successfully.',
            'data' => $vendor,
        ], 201);
    }

    /**
     * Update vendor processor details & DPA execution.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'vendor_name' => 'sometimes|string|max:255',
            'service_category' => 'sometimes|string|max:255',
            'cookie_category' => 'nullable|string|in:strictly_necessary,functional,analytics,marketing,none',
            'cookies_detected' => 'nullable|array',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string',
            'data_types_processed' => 'sometimes|array',
            'dpa_signed' => 'boolean',
            'dpa_signed_date' => 'nullable|date',
            'risk_rating' => 'sometimes|in:low,medium,high,critical',
            'hosting_country' => 'nullable|string',
            'is_cross_border' => 'boolean',
            'status' => 'sometimes|in:active,under_review,terminated',
        ]);

        $vendor->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Third-party processor updated successfully.',
            'data' => $vendor,
        ]);
    }

    /**
     * Auto-detect and map cookies to vendors (TruePriv Data Discovery).
     */
    public function autoDiscoverCookies(): JsonResponse
    {
        $discoveryMap = [
            'google' => ['category' => 'analytics', 'cookies' => ['_ga', '_gid', '_gat_UA']],
            'analytics' => ['category' => 'analytics', 'cookies' => ['_ga', '_gid']],
            'meta' => ['category' => 'marketing', 'cookies' => ['_fbp', '_fbc', 'fr']],
            'facebook' => ['category' => 'marketing', 'cookies' => ['_fbp', '_fbc', 'fr']],
            'linkedin' => ['category' => 'marketing', 'cookies' => ['bcookie', 'li_sugr', 'UserMatchHistory']],
            'paystack' => ['category' => 'strictly_necessary', 'cookies' => ['pstk_session', '__cf_bm']],
            'flutterwave' => ['category' => 'strictly_necessary', 'cookies' => ['flw_session', 'device_id']],
            'intercom' => ['category' => 'functional', 'cookies' => ['intercom-id', 'intercom-session']],
            'zendesk' => ['category' => 'functional', 'cookies' => ['__zlcmid', '_zendesk_session']],
            'aws' => ['category' => 'strictly_necessary', 'cookies' => ['AWSALB', 'AWSALBCORS']],
            'amazon' => ['category' => 'strictly_necessary', 'cookies' => ['AWSALB', 'AWSALBCORS']],
            'microsoft' => ['category' => 'strictly_necessary', 'cookies' => ['MSISAuth', 'buid']],
            'azure' => ['category' => 'strictly_necessary', 'cookies' => ['AppServiceSession', 'ARRAffinity']],
        ];

        $vendors = Vendor::all();
        $updatedCount = 0;

        foreach ($vendors as $vendor) {
            $lowerName = strtolower($vendor->vendor_name . ' ' . $vendor->service_category);
            $matched = false;
            foreach ($discoveryMap as $keyword => $info) {
                if (str_contains($lowerName, $keyword)) {
                    $vendor->update([
                        'cookie_category' => $info['category'],
                        'cookies_detected' => $info['cookies'],
                    ]);
                    $updatedCount++;
                    $matched = true;
                    break;
                }
            }
            if (!$matched && empty($vendor->cookie_category)) {
                $vendor->update([
                    'cookie_category' => 'strictly_necessary',
                    'cookies_detected' => ['session_id', 'csrf_token'],
                ]);
                $updatedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "TruePriv discovery completed. Mapped {$updatedCount} vendor cookie profiles.",
            'updated_count' => $updatedCount,
            'vendors' => Vendor::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Delete vendor.
     */
    public function destroy(string $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vendor deleted.'
        ]);
    }
}
