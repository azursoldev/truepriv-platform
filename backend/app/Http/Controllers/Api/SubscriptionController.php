<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    /**
     * Plan pricing specifications (in NGN).
     */
    const PLAN_PRICING = [
        'starter_corporate' => [
            'name' => 'Starter Corporate (Pilot)',
            'tier' => 'starter_corporate',
            'annual_ngn' => 0,
            'monthly_ngn' => 0,
            'features' => [
                'Up to 3 Third-Party Processors',
                'Single Department ROPA Registry',
                'Standard Cookie Banner CMP',
                'Community Support',
                'Statutory PDF/CSV Filing Export Locked',
            ],
            'can_export_reports' => false,
        ],
        'growth_enterprise' => [
            'name' => 'Growth Enterprise (MDC Certified)',
            'tier' => 'growth_enterprise',
            'annual_ngn' => 450000.00,
            'monthly_ngn' => 45000.00,
            'features' => [
                'Unlimited Third-Party Processors',
                'Decentralized Department Champion Desk',
                'Dual-Residency Galaxy Backbone Sovereignty',
                'Ketch-Style Zero-GTM Cookie Consent Suite',
                'Full Statutory PDF/CSV NDPC Audit Report Exports',
                'Standard SLA (24h turnaround)',
            ],
            'can_export_reports' => true,
        ],
        'dpo_unlimited' => [
            'name' => 'Outsourced DPO Professional Suite',
            'tier' => 'dpo_unlimited',
            'annual_ngn' => 850000.00,
            'monthly_ngn' => 85000.00,
            'features' => [
                'Up to 15 Retained Client Portfolios',
                'Multi-Tenant DPO Switcher',
                'Automated DPIA Risk Calculators & Stamps',
                'TruePriv Autonomous AI Compliance Agent',
                'Unlimited Official Report Exports',
                'Priority DPO Hotline Support',
            ],
            'can_export_reports' => true,
        ],
        'dpco_audit_suite' => [
            'name' => 'Licensed DPCO Practice Suite',
            'tier' => 'dpco_audit_suite',
            'annual_ngn' => 1250000.00,
            'monthly_ngn' => 125000.00,
            'features' => [
                'Unlimited Corporate Audit Client Workspaces',
                'GAID 5-Domain Statutory Audit Checklist Engine',
                'Evidence Locker & Digital Auditor Stamping',
                'Direct NDPC Annual Filing Pack Generation (March 15)',
                'Dedicated Account Director & 2-Hour SLA',
            ],
            'can_export_reports' => true,
        ],
    ];

    /**
     * Get active subscription details and available plans.
     */
    public function show(Request $request): JsonResponse
    {
        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $subscription = Subscription::where('tenant_id', $tenantId)
            ->latest()
            ->first();

        // If no subscription exists, generate initial starter trial
        if (!$subscription) {
            $subscription = Subscription::create([
                'tenant_id' => $tenantId,
                'plan_tier' => 'starter_corporate',
                'billing_cycle' => 'annual',
                'price_ngn' => 0.00,
                'status' => 'trialing',
                'current_period_start' => now(),
                'current_period_end' => now()->addDays(14),
            ]);
        }

        $payments = Payment::where('tenant_id', $tenantId)
            ->orderBy('paid_at', 'desc')
            ->limit(10)
            ->get();

        $daysRemaining = null;
        if ($subscription->current_period_end) {
            $daysRemaining = max(0, (int) now()->diffInDays($subscription->current_period_end, false));
        }

        return response()->json([
            'success' => true,
            'data' => [
                'subscription' => $subscription,
                'days_remaining' => $daysRemaining,
                'is_active_paid' => in_array($subscription->status, ['active']) && in_array($subscription->plan_tier, ['growth_enterprise', 'dpo_unlimited', 'dpco_audit_suite']),
                'can_export_reports' => $tenant->canExportComplianceReports(),
                'available_plans' => self::PLAN_PRICING,
                'payments_history' => $payments,
                'paystack_public_key' => config('services.paystack.public_key', 'pk_test_truepriv_compliance_2026'),
            ],
        ]);
    }

    /**
     * Initialize Paystack transaction payload.
     */
    public function initializePaystack(Request $request): JsonResponse
    {
        $request->validate([
            'plan_tier' => 'required|in:growth_enterprise,dpo_unlimited,dpco_audit_suite',
            'billing_cycle' => 'required|in:annual,monthly',
        ]);

        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);
        $user = $request->user();

        $tierConfig = self::PLAN_PRICING[$request->plan_tier];
        $price = $request->billing_cycle === 'annual' ? $tierConfig['annual_ngn'] : $tierConfig['monthly_ngn'];

        $reference = 'TP-PAY-' . strtoupper(Str::random(12));

        return response()->json([
            'success' => true,
            'data' => [
                'reference' => $reference,
                'amount_kobo' => (int) ($price * 100),
                'amount_ngn' => $price,
                'plan_tier' => $request->plan_tier,
                'plan_name' => $tierConfig['name'],
                'billing_cycle' => $request->billing_cycle,
                'email' => $user->email,
                'tenant_name' => $tenant->name,
                'public_key' => config('services.paystack.public_key', 'pk_test_truepriv_compliance_2026'),
            ],
        ]);
    }

    /**
     * Upgrade subscription and log payment transaction.
     */
    public function upgrade(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_tier' => 'required|in:growth_enterprise,dpo_unlimited,dpco_audit_suite',
            'billing_cycle' => 'required|in:annual,monthly',
            'payment_gateway' => 'nullable|in:paystack,flutterwave,bank_transfer',
            'transaction_reference' => 'nullable|string|max:100',
        ]);

        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $tierConfig = self::PLAN_PRICING[$validated['plan_tier']];
        $price = $validated['billing_cycle'] === 'annual' ? $tierConfig['annual_ngn'] : $tierConfig['monthly_ngn'];

        $periodStart = now();
        $periodEnd = $validated['billing_cycle'] === 'annual' ? now()->addYear() : now()->addMonth();

        // 1. Create or Update active Subscription
        $subscription = Subscription::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'plan_tier' => $validated['plan_tier'],
                'billing_cycle' => $validated['billing_cycle'],
                'price_ngn' => $price,
                'status' => 'active',
                'current_period_start' => $periodStart,
                'current_period_end' => $periodEnd,
            ]
        );

        // 2. Log official Payment record
        $reference = $validated['transaction_reference'] ?? ('TP-TXN-' . strtoupper(Str::random(12)));
        $payment = Payment::create([
            'subscription_id' => $subscription->id,
            'tenant_id' => $tenantId,
            'transaction_reference' => $reference,
            'payment_gateway' => $validated['payment_gateway'] ?? 'paystack',
            'amount_paid' => $price,
            'currency' => 'NGN',
            'gateway_status' => 'successful',
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Successfully upgraded to {$tierConfig['name']}! All compliance reporting and export features unlocked.",
            'data' => [
                'subscription' => $subscription->fresh(),
                'payment' => $payment,
                'can_export_reports' => $tenant->fresh()->canExportComplianceReports(),
            ],
        ]);
    }
}
