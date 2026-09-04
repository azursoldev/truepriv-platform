<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CookieBanner;
use App\Models\CookieConsent;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CookieController extends Controller
{
    /**
     * Get banner configuration for active tenant.
     */
    public function getBannerConfig(): JsonResponse
    {
        $banner = CookieBanner::firstOrCreate(
            ['tenant_id' => app('current_tenant_id')],
            [
                'domain' => 'https://' . (app('current_tenant')->slug ?? 'company') . '.com',
                'theme_color' => '#059669',
                'position' => 'bottom_bar',
                'company_display_name' => app('current_tenant')->name ?? 'This Website',
                'custom_notice_text' => 'We use cookies in compliance with the Nigeria Data Protection Act (NDPA 2023).',
                'is_active' => true,
            ]
        );

        $embedCode = sprintf(
            '<script src="%s/embeds/dp-consent.js" data-tenant-id="%s" data-company-name="%s" data-primary-color="%s" data-privacy-url="%s"></script>',
            config('app.url', 'http://127.0.0.1:8000'),
            $banner->tenant_id,
            htmlspecialchars($banner->company_display_name ?? 'Our Website', ENT_QUOTES),
            $banner->theme_color,
            $banner->privacy_policy_url ?? '#privacy'
        );

        return response()->json([
            'success' => true,
            'banner' => $banner,
            'embed_code' => $embedCode,
        ]);
    }

    /**
     * Update banner customization.
     */
    public function updateBannerConfig(Request $request): JsonResponse
    {
        $banner = CookieBanner::where('tenant_id', app('current_tenant_id'))->firstOrFail();

        $validated = $request->validate([
            'domain' => 'required|string|max:255',
            'theme_color' => 'required|string|max:20',
            'position' => 'required|in:bottom_bar,floating_bottom_left,floating_bottom_right,center_modal',
            'privacy_policy_url' => 'nullable|string|max:255',
            'company_display_name' => 'nullable|string|max:255',
            'custom_notice_text' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $banner->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cookie banner preferences updated.',
            'banner' => $banner,
        ]);
    }

    /**
     * Public Consent Logging API called by the Vanilla JS Cookie Client.
     * Buffers incoming consents asynchronously in background Queue pool to handle high-volume client websites.
     */
    public function logConsent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|uuid',
            'visitor_uuid' => 'required|string|max:255',
            'accepted_categories' => 'required|array',
            'user_agent' => 'nullable|string',
        ]);

        $tenant = Tenant::find($validated['tenant_id']);
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Unknown tenant.'], 404);
        }

        // Anonymize IP address via SHA-256 for NDPA data privacy
        $ipHash = hash('sha256', $request->ip() . 'salt_ndpa_2026');

        $consentData = [
            'tenant_id' => $tenant->id,
            'visitor_uuid' => $validated['visitor_uuid'],
            'accepted_categories' => $validated['accepted_categories'],
            'ip_hash' => $ipHash,
            'user_agent' => $validated['user_agent'] ?? $request->header('User-Agent'),
            'consented_at' => now()->toIso8601String(),
        ];

        // Asynchronously buffer cookie proof of consent via Queue Worker
        \App\Jobs\ProcessCookieConsentLog::dispatch($consentData);

        return response()->json([
            'success' => true,
            'status' => 'queued',
            'message' => 'Proof of cookie consent queued asynchronously for ingestion.',
            'visitor_uuid' => $validated['visitor_uuid'],
        ], 202);
    }

    /**
     * Consent Analytics for active tenant.
     */
    public function getAnalytics(): JsonResponse
    {
        $consents = CookieConsent::orderBy('created_at', 'desc')->take(100)->get();
        $totalLogs = CookieConsent::count();

        return response()->json([
            'success' => true,
            'total_consents' => $totalLogs,
            'recent_logs' => $consents,
        ]);
    }
}
