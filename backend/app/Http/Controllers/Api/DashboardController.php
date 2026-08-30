<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditFinding;
use App\Models\AuditProject;
use App\Models\DataBreach;
use App\Models\DpiaAssessment;
use App\Models\DsarRequest;
use App\Models\RopaActivity;
use App\Models\Tenant;
use App\Models\TenantClientOrganization;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return comprehensive real-time NDPA compliance KPI metrics for the active tenant.
     */
    public function metrics(Request $request): JsonResponse
    {
        $tenantId = app('current_tenant_id');
        $tenant = app('current_tenant') ?? Tenant::find($tenantId);

        // 1. RoPA metrics
        $ropaTotal = RopaActivity::count();
        $ropaApproved = RopaActivity::where('status', 'approved_active')->count();
        $ropaPendingReview = RopaActivity::whereIn('status', ['draft', 'reviewed_by_dept', 'verified_by_dpo'])->count();
        $ropaSpecialData = RopaActivity::where('special_category_data', true)->count();
        $ropaCrossBorder = RopaActivity::where('cross_border_transfer', true)->count();

        // 2. DPIA metrics
        $dpiaTotal = DpiaAssessment::count();
        $dpiaHighRisk = DpiaAssessment::whereIn('residual_risk_level', ['high', 'critical'])->count();
        $dpiaApproved = DpiaAssessment::where('dpo_sign_off_status', 'approved')->count();

        // 3. DSAR SLA metrics
        $dsarOpen = DsarRequest::whereNotIn('status', ['completed', 'rejected'])->count();
        $dsarUrgent = DsarRequest::whereNotIn('status', ['completed', 'rejected'])
            ->where('sla_deadline', '<=', now()->addDays(7))
            ->count();
        $dsarCompleted = DsarRequest::where('status', 'completed')->count();

        // 4. Data Breach 72-Hour Clock metrics
        $breachActive = DataBreach::whereNotIn('status', ['closed'])->count();
        $breachUrgentClock = DataBreach::whereNotIn('status', ['closed', 'ndpc_notified'])
            ->where('ndpc_notification_deadline', '>=', now())
            ->count();

        // 5. Vendor & TPRM metrics
        $vendorTotal = Vendor::count();
        $vendorSignedDpa = Vendor::where('dpa_signed', true)->count();
        $vendorHighRisk = Vendor::whereIn('risk_rating', ['high', 'critical'])->count();

        // 6. Audit & Findings
        $auditProjects = AuditProject::latest()->take(3)->get();
        $findingsOpen = AuditFinding::whereIn('status', ['open', 'in_remediation'])->count();
        $findingsCritical = AuditFinding::whereIn('status', ['open', 'in_remediation'])
            ->whereIn('severity', ['critical', 'high'])
            ->count();

        // 7. Dynamic Compliance Readiness Index Calculation
        $score = $tenant ? $tenant->compliance_score : 0;
        if ($score == 0 && $ropaTotal > 0) {
            $ropaScore = ($ropaApproved / max(1, $ropaTotal)) * 30; // Max 30 pts
            $dpaScore = ($vendorSignedDpa / max(1, $vendorTotal)) * 20; // Max 20 pts
            $dpiaScore = ($dpiaApproved / max(1, $dpiaTotal)) * 20; // Max 20 pts
            $findingPenalty = min(30, $findingsCritical * 5);
            $calculatedScore = max(10, round($ropaScore + $dpaScore + $dpiaScore + 30 - $findingPenalty, 2));
            $score = min(100, $calculatedScore);
            if ($tenant) {
                $tenant->update(['compliance_score' => $score]);
            }
        }

        return response()->json([
            'success' => true,
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'type' => $tenant->type,
                'industry' => $tenant->industry,
                'rc_number' => $tenant->rc_number,
                'compliance_score' => $score,
            ],
            'compliance_gauge' => [
                'score' => $score,
                'status' => $score >= 80 ? 'Optimal Compliance' : ($score >= 50 ? 'Moderate Compliance' : 'High Risk Non-Compliance'),
                'target_deadline' => 'March 15, 2027 (NDPC Statutory Filing Deadline)',
            ],
            'ropa' => [
                'total' => $ropaTotal,
                'approved' => $ropaApproved,
                'pending_review' => $ropaPendingReview,
                'special_category_data_count' => $ropaSpecialData,
                'cross_border_count' => $ropaCrossBorder,
            ],
            'dpia' => [
                'total' => $dpiaTotal,
                'high_residual_risk' => $dpiaHighRisk,
                'approved' => $dpiaApproved,
            ],
            'dsar' => [
                'open_requests' => $dsarOpen,
                'urgent_under_7_days' => $dsarUrgent,
                'completed' => $dsarCompleted,
            ],
            'breaches' => [
                'active_incidents' => $breachActive,
                'active_72h_clocks' => $breachUrgentClock,
            ],
            'vendors' => [
                'total_processors' => $vendorTotal,
                'dpa_executed_count' => $vendorSignedDpa,
                'missing_dpa_count' => max(0, $vendorTotal - $vendorSignedDpa),
                'high_risk_vendors' => $vendorHighRisk,
            ],
            'audits' => [
                'projects' => $auditProjects,
                'open_findings' => $findingsOpen,
                'critical_high_findings' => $findingsCritical,
            ],
        ]);
    }

    /**
     * Portfolio metrics for Outsourced DPOs and DPCO Firms managing multiple clients.
     */
    public function portfolio(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['super_admin', 'dpco_lead_auditor', 'dpco_staff', 'outsourced_dpo'])) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Only DPO consultants and DPCO audit firms can access the portfolio desk.'
            ], 403);
        }

        $engagements = TenantClientOrganization::with(['clientTenant', 'leadAuditor'])
            ->where('parent_tenant_id', $user->tenant_id)
            ->get();

        $portfolioData = $engagements->map(function ($eng) {
            $client = $eng->clientTenant;
            $activeBreaches = DataBreach::withoutGlobalScopes()->where('tenant_id', $client->id)->where('status', '!=', 'closed')->count();
            $openDsars = DsarRequest::withoutGlobalScopes()->where('tenant_id', $client->id)->whereNotIn('status', ['completed', 'rejected'])->count();
            $openFindings = AuditFinding::withoutGlobalScopes()
                ->whereHas('auditProject', function ($q) use ($client) {
                    $q->where('tenant_id', $client->id);
                })
                ->whereIn('status', ['open', 'in_remediation'])
                ->count();

            return [
                'id' => $eng->id,
                'client_tenant_id' => $client->id,
                'client_name' => $client->name,
                'slug' => $client->slug,
                'industry' => $client->industry,
                'compliance_score' => $client->compliance_score,
                'contract_ref' => $eng->contract_ref,
                'service_scope' => $eng->service_scope,
                'lead_officer' => $eng->leadAuditor ? $eng->leadAuditor->name : 'Unassigned',
                'active_breaches' => $activeBreaches,
                'open_dsars' => $openDsars,
                'open_findings' => $openFindings,
                'status' => $eng->status,
            ];
        });

        return response()->json([
            'success' => true,
            'clients_count' => $engagements->count(),
            'clients' => $portfolioData,
        ]);
    }
}
