<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use App\Models\RopaActivity;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PolicyController extends Controller
{
    /**
     * List all generated policies for the active tenant.
     */
    public function index(): JsonResponse
    {
        $policies = Policy::with('creator')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $policies,
        ]);
    }

    /**
     * Auto-Generate NDPA Policy based on tenant's live RoPA and corporate metadata.
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'policy_type' => 'required|in:privacy_notice_website,employee_privacy_policy,data_retention_schedule,incident_response_policy,data_protection_agreement_dpa',
            'dpo_name' => 'nullable|string',
            'dpo_email' => 'nullable|email',
        ]);

        $tenantId = app('current_tenant_id');
        $tenant = app('current_tenant') ?? Tenant::find($tenantId);
        $ropaActivities = RopaActivity::get();

        $dpoName = $request->dpo_name ?? 'Designated Data Protection Officer';
        $dpoEmail = $request->dpo_email ?? ($tenant->contact_email ?? 'dpo@' . $tenant->slug . '.ng');
        $orgName = $tenant->name;

        $title = '';
        $content = '';

        switch ($request->policy_type) {
            case 'privacy_notice_website':
                $title = "{$orgName} Website Privacy Notice (NDPA 2023 Compliant)";
                $content = $this->buildPrivacyNoticeContent($orgName, $tenant, $ropaActivities, $dpoName, $dpoEmail);
                break;
            case 'employee_privacy_policy':
                $title = "{$orgName} Employee & Workplace Data Protection Policy";
                $content = $this->buildEmployeePolicyContent($orgName, $dpoName, $dpoEmail);
                break;
            case 'data_retention_schedule':
                $title = "{$orgName} Statutory Data Retention & Disposal Schedule";
                $content = $this->buildRetentionScheduleContent($orgName, $ropaActivities);
                break;
            case 'incident_response_policy':
                $title = "{$orgName} 72-Hour Data Breach Incident Response Protocol";
                $content = $this->buildBreachPolicyContent($orgName, $dpoName, $dpoEmail);
                break;
            case 'data_protection_agreement_dpa':
                $title = "Standard Data Processing Agreement (DPA) Schedule";
                $content = $this->buildDpaContent($orgName);
                break;
        }

        $policy = Policy::create([
            'tenant_id' => $tenant->id,
            'title' => $title,
            'type' => $request->policy_type,
            'content' => $content,
            'version' => '1.0',
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Policy successfully auto-generated from your organization compliance profile.',
            'policy' => $policy,
        ], 201);
    }

    /**
     * Publish or update policy content.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $policy = Policy::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'version' => 'sometimes|string|max:20',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'published') {
            $policy->published_at = now();
        }

        $policy->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Policy updated.',
            'policy' => $policy,
        ]);
    }

    private function buildPrivacyNoticeContent($orgName, $tenant, $ropa, $dpoName, $dpoEmail): string
    {
        $ropaList = $ropa->map(function ($r) {
            return "- **{$r->process_name}**: Legal Basis: " . strtoupper($r->legal_basis) . " | Retention: {$r->retention_period}";
        })->implode("\n");

        return "## {$orgName}\n### STATUTORY PRIVACY NOTICE\n**In Compliance with Nigeria Data Protection Act 2023 (NDPA)**\n\n" .
            "**1. OVERVIEW & SCOPE**\nThis Privacy Notice explains how {$orgName} (\"we\", \"us\", \"our\"), registered under CAC RC No. " . ($tenant->rc_number ?? 'N/A') . ", processes personal data in accordance with the Nigeria Data Protection Act (NDPA 2023).\n\n" .
            "**2. DATA PROCESSING ACTIVITIES & PURPOSES**\nBased on our Record of Processing Activities (RoPA), we process personal data for the following legitimate purposes:\n" .
            ($ropaList ?: "- Direct customer service provision, KYC compliance, and technical service delivery.") . "\n\n" .
            "**3. YOUR STATUTORY RIGHTS UNDER NDPA SECTIONS 34–38**\n- Right to Access & Data Portability\n- Right to Rectification of inaccurate records\n- Right to Erasure ('Right to be Forgotten')\n- Right to Object to automated decision-making and direct marketing.\n\n" .
            "**4. CONTACT OUR DATA PROTECTION OFFICER (DPO)**\nFor inquiries or to submit a Data Subject Access Request:\n- **DPO Name:** {$dpoName}\n- **DPO Email:** {$dpoEmail}\n- **Address:** " . ($tenant->address ?? 'Lagos, Nigeria');
    }

    private function buildEmployeePolicyContent($orgName, $dpoName, $dpoEmail): string
    {
        return "## {$orgName}\n### INTERNAL EMPLOYEE DATA PROTECTION & ACCEPTABLE USE POLICY\n\n" .
            "**1. PURPOSE**\nTo establish guidelines for processing employee personal data, safeguarding confidential information, and ensuring workplace compliance with the Nigeria Data Protection Act 2023.\n\n" .
            "**2. EMPLOYEE DATA CATEGORIES**\nPayroll records, BVN/NIN, performance appraisals, emergency next of kin, and health insurance enrolments.\n\n" .
            "**3. CONFIDENTIALITY OBLIGATIONS**\nAll staff must maintain strict confidentiality regarding customer and corporate personal data. Unauthorized extraction or personal forwarding of customer databases constitutes gross misconduct and a criminal violation under NDPA Section 49.\n\n" .
            "**4. DPO CONTACT & WHISTLEBLOWING**\nContact {$dpoName} at {$dpoEmail}.";
    }

    private function buildRetentionScheduleContent($orgName, $ropa): string
    {
        return "## {$orgName}\n### DATA RETENTION & DISPOSAL SCHEDULE (NDPA 2023)\n\n" .
            "| Processing Category | Legal Minimum Retention | Disposal Method |\n" .
            "| :--- | :--- | :--- |\n" .
            "| Customer KYC & Identification | 6 Years post-account termination (CBN/AML) | Cryptographic Erasure |\n" .
            "| Financial & Tax Records | 7 Years (FIRS / PITA Act) | Certified Cloud Purge |\n" .
            "| Employee HR Records | 7 Years post-separation | Secure Shredding & DB Delete |\n" .
            "| Web Analytics & Server Logs | 12 Months | Automated Rotation |\n" .
            "| Closed Customer Support Tickets | 2 Years | Automated Archive Purge |";
    }

    private function buildBreachPolicyContent($orgName, $dpoName, $dpoEmail): string
    {
        return "## {$orgName}\n### 72-HOUR STATUTORY DATA BREACH RESPONSE PROCEDURE\n\n" .
            "**1. STATUTORY NOTIFICATION TIMELINE (NDPA SECTION 40)**\nUpon discovering any breach of personal data that is likely to result in a risk to the rights and freedoms of individuals, the organization must notify the **Nigeria Data Protection Commission (NDPC)** within **72 hours**.\n\n" .
            "**2. BREACH RESPONSE TEAM**\n- Incident Commander: {$dpoName} ({$dpoEmail})\n- Technical Lead: Head of IT / Infrastructure\n- Legal Counsel: Corporate Legal Officer\n\n" .
            "**3. PHASE 1: IDENTIFICATION & CONTAINMENT (0–12 Hours)**\nIsolate compromised systems, reset privileged tokens, and preserve forensic audit logs.\n\n" .
            "**4. PHASE 2: RISK TRIAGE & NDPC FILING (12–72 Hours)**\nPrepare official NDPC Form 1 notification pack and submit via NDPC regulatory portal.";
    }

    private function buildDpaContent($orgName): string
    {
        return "## STANDARD DATA PROCESSING AGREEMENT (DPA)\n### PURSUANT TO SECTION 29 OF THE NIGERIA DATA PROTECTION ACT 2023\n\n" .
            "**BETWEEN:**\n1. **{$orgName}** (the \"Data Controller\")\n2. **The Designated Third-Party Processor** (the \"Data Processor\")\n\n" .
            "**1. SCOPE & INSTRUCTIONS**\nThe Processor shall process personal data solely on documented instructions from the Controller.\n\n" .
            "**2. SUB-PROCESSORS**\nThe Processor shall not engage any sub-processor without prior written authorization from the Controller.\n\n" .
            "**3. SECURITY & BREACH NOTIFICATION**\nThe Processor must implement technical measures (AES-256 encryption, access controls) and notify the Controller within **24 hours** of any suspected security breach.";
    }
}
