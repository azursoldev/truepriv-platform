<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataBreach;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BreachController extends Controller
{
    /**
     * List all data breach incidents for active tenant with live hours remaining on 72h clock.
     */
    public function index(): JsonResponse
    {
        $breaches = DataBreach::with('leadResponder')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $breaches->map(function ($breach) {
            return array_merge($breach->toArray(), [
                'hours_remaining' => $breach->hours_remaining,
                'is_urgent' => $breach->hours_remaining <= 24 && !$breach->is_ndpc_notified,
            ]);
        });

        return response()->json([
            'success' => true,
            'count' => $data->count(),
            'data' => $data,
        ]);
    }

    /**
     * Report and triage a new data breach incident (starts 72-hour statutory NDPC clock).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'nature_of_incident' => 'required|in:unauthorized_access,ransomware_malware,lost_stolen_device,accidental_disclosure_email,insider_threat,phishing_credential_theft,physical_theft,misconfigured_cloud_bucket,other',
            'date_time_occurred' => 'nullable|date',
            'date_time_discovered' => 'required|date',
            'estimated_affected_subjects' => 'required|integer|min:0',
            'compromised_data_categories' => 'required|array',
            'risk_assessment_level' => 'required|in:low,medium,high_to_rights_freedoms,critical_systemic',
            'containment_steps_taken' => 'nullable|string',
            'remedial_measures' => 'nullable|string',
        ]);

        $discoveredAt = \Carbon\Carbon::parse($validated['date_time_discovered']);
        $riskLevel = $validated['risk_assessment_level'];

        // Dynamic Sectoral Regulatory Deadline Calculation:
        // Industry-Agnostic Timer Adjustment (NCC Telecom 48h/4h, CBN Banking 24h/48h, NDPA 72h baseline)
        $tenant = \App\Models\Tenant::find(app('current_tenant_id'));
        $industry = strtolower($tenant->industry ?? '');

        $regulatoryHours = 72; // Default statutory NDPA 2023 Section 40 baseline
        $applicableFramework = 'NDPA 2023 Section 40 (72-Hour General Baseline)';

        if (in_array($industry, ['telecom', 'telecoms', 'telecommunications', 'isp', 'internet_service_provider', 'critical_national_infrastructure', 'cni'])) {
            if (in_array($riskLevel, ['critical_systemic', 'critical'])) {
                $regulatoryHours = 4; // NCC Major Cyber Incident Initial Alert Window
                $applicableFramework = 'NCC Framework (4-Hour Major Cyber Incident Emergency Triage)';
            } else {
                $regulatoryHours = 48; // NCC Standard Telecommunications Reporting Window
                $applicableFramework = 'NCC Framework (48-Hour Telecom/ISP Statutory Reporting)';
            }
        } elseif (in_array($industry, ['banking', 'fintech', 'financial_services', 'microfinance', 'insurance'])) {
            if (in_array($riskLevel, ['critical_systemic', 'high_to_rights_freedoms'])) {
                $regulatoryHours = 24; // CBN Tier-1 Critical Financial Incident Window
                $applicableFramework = 'CBN / NDPC Tier-1 Financial Directive (24-Hour Emergency Clock)';
            } else {
                $regulatoryHours = 48; // CBN Standard Financial Incident Notification
                $applicableFramework = 'CBN / NDPA Sectoral Clock (48-Hour Financial Window)';
            }
        } elseif (in_array($industry, ['healthcare', 'health', 'hospital', 'biometrics'])) {
            $regulatoryHours = 48; // Health Sector High-Risk Patient Data Window
            $applicableFramework = 'NDPC Health Data Safeguard Directive (48-Hour Clock)';
        }

        $regulatoryDeadline = $discoveredAt->copy()->addHours($regulatoryHours);
        $incidentNumber = 'INC-' . date('Y') . '-' . strtoupper(Str::random(5));

        $breach = DataBreach::create([
            'tenant_id' => app('current_tenant_id'),
            'incident_number' => $incidentNumber,
            'title' => $validated['title'],
            'nature_of_incident' => $validated['nature_of_incident'],
            'date_time_occurred' => $validated['date_time_occurred'] ?? null,
            'date_time_discovered' => $discoveredAt,
            'ndpc_notification_deadline' => $regulatoryDeadline,
            'estimated_affected_subjects' => $validated['estimated_affected_subjects'],
            'compromised_data_categories' => $validated['compromised_data_categories'],
            'risk_assessment_level' => $validated['risk_assessment_level'],
            'containment_steps_taken' => $validated['containment_steps_taken'] ?? null,
            'remedial_measures' => $validated['remedial_measures'] ?? null,
            'status' => 'reported_triage',
            'lead_responder_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data breach incident logged. {$regulatoryHours}-Hour statutory countdown clock initiated under {$applicableFramework}.",
            'data' => $breach,
            'ndpc_notification_deadline' => $regulatoryDeadline->toIso8601String(),
            'regulatory_hours' => $regulatoryHours,
            'applicable_framework' => $applicableFramework,
            'hours_remaining' => $breach->hours_remaining,
        ], 201);
    }

    /**
     * Record statutory NDPC notification submission (Section 40 NDPA).
     */
    public function recordNdpcNotification(Request $request, string $id): JsonResponse
    {
        $breach = DataBreach::findOrFail($id);

        $request->validate([
            'ndpc_reference_number' => 'required|string|max:255',
            'remedial_measures' => 'nullable|string',
        ]);

        $breach->is_ndpc_notified = true;
        $breach->ndpc_notified_at = now();
        $breach->ndpc_reference_number = $request->ndpc_reference_number;
        if ($request->has('remedial_measures')) {
            $breach->remedial_measures = $request->remedial_measures;
        }
        $breach->status = 'ndpc_notified';
        $breach->save();

        return response()->json([
            'success' => true,
            'message' => 'NDPC formal breach notification logged successfully with regulatory reference number.',
            'data' => $breach,
        ]);
    }

    /**
     * Generate auto-filled NDPC Statutory Form 1 Notification Pack.
     */
    public function generateNdpcForm(string $id): JsonResponse
    {
        $breach = DataBreach::with(['tenant', 'leadResponder'])->findOrFail($id);
        $tenant = $breach->tenant;

        $formPack = [
            'form_title' => 'NDPC FORM 1: NOTIFICATION OF PERSONAL DATA BREACH',
            'statutory_reference' => 'Section 40, Nigeria Data Protection Act 2023',
            'date_generated' => now()->format('d F Y, H:i T'),
            'organization_details' => [
                'name' => $tenant->name,
                'rc_number' => $tenant->rc_number ?? 'N/A',
                'ndpc_registration_number' => $tenant->ndpc_registration_number ?? 'Pending',
                'industry' => $tenant->industry,
                'address' => $tenant->address ?? 'Lagos, Nigeria',
                'contact_email' => $tenant->contact_email,
            ],
            'incident_summary' => [
                'incident_code' => $breach->incident_number,
                'nature_of_breach' => strtoupper(str_replace('_', ' ', $breach->nature_of_incident)),
                'date_discovered' => $breach->date_time_discovered->format('d M Y, H:i T'),
                'hours_elapsed_since_discovery' => round($breach->date_time_discovered->diffInHours(now()), 1),
                'estimated_affected_subjects' => $breach->estimated_affected_subjects,
                'compromised_data_categories' => $breach->compromised_data_categories,
                'assessed_risk_to_rights_freedoms' => strtoupper(str_replace('_', ' ', $breach->risk_assessment_level)),
            ],
            'mitigation_and_containment' => [
                'containment_steps' => $breach->containment_steps_taken ?? 'Immediate isolation of affected systems and credential reset.',
                'remedial_measures' => $breach->remedial_measures ?? 'Enhanced firewall rules, continuous logging, customer notice dispatch.',
            ],
            'dpo_contact' => [
                'officer_name' => $breach->leadResponder ? $breach->leadResponder->name : 'Designated DPO',
                'officer_email' => $breach->leadResponder ? $breach->leadResponder->email : $tenant->contact_email,
            ]
        ];

        return response()->json([
            'success' => true,
            'form_pack' => $formPack,
        ]);
    }
}
