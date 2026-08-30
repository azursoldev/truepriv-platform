<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditChecklistItem;
use App\Models\AuditEvidence;
use App\Models\AuditFinding;
use App\Models\AuditProject;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuditController extends Controller
{
    /**
     * List audit projects for the active tenant.
     */
    public function index(): JsonResponse
    {
        $projects = AuditProject::with(['dpcoFirm', 'leadAuditor'])
            ->withCount(['checklistItems', 'findings', 'evidences'])
            ->orderBy('audit_year', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * Get specific audit project with checklist domains, findings, and evidence.
     */
    public function show(string $id): JsonResponse
    {
        $project = AuditProject::with([
            'dpcoFirm',
            'leadAuditor',
            'checklistItems' => function ($q) {
                $q->orderBy('section_code', 'asc');
            },
            'findings.assignee',
            'evidences.uploader'
        ])->findOrFail($id);

        // Group checklist items by NDPC GAID domains
        $groupedChecklist = $project->checklistItems->groupBy('domain');

        return response()->json([
            'success' => true,
            'project' => $project,
            'grouped_checklist' => $groupedChecklist,
        ]);
    }

    /**
     * Update checklist item scoring and auditor findings.
     */
    public function updateChecklistItem(Request $request, string $itemId): JsonResponse
    {
        $item = AuditChecklistItem::findOrFail($itemId);

        $validated = $request->validate([
            'status' => 'required|in:compliant,partially_compliant,non_compliant,not_applicable,pending_review',
            'awarded_points' => 'required|numeric|min:0|max:5',
            'auditor_findings' => 'nullable|string',
            'client_notes' => 'nullable|string',
        ]);

        $item->update($validated);

        // Auto-recalculate project overall compliance score
        $newScore = $item->auditProject->recalculateScore();

        return response()->json([
            'success' => true,
            'message' => 'Checklist item updated and audit score recalculated.',
            'item' => $item,
            'new_overall_score' => $newScore,
        ]);
    }

    /**
     * Create or update remediation finding.
     */
    public function storeFinding(Request $request, string $projectId): JsonResponse
    {
        $project = AuditProject::findOrFail($projectId);

        $validated = $request->validate([
            'checklist_item_id' => 'nullable|uuid',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:critical,high,medium,low,observation',
            'recommendation' => 'required|string',
            'remediation_plan' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'target_resolution_date' => 'nullable|date',
            'status' => 'in:open,in_remediation,resolved,verified_closed',
        ]);

        $validated['audit_project_id'] = $project->id;
        $finding = AuditFinding::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Audit finding recorded in remediation tracker.',
            'finding' => $finding,
        ], 201);
    }

    /**
     * Update finding remediation status.
     */
    public function updateFinding(Request $request, string $findingId): JsonResponse
    {
        $finding = AuditFinding::findOrFail($findingId);

        $validated = $request->validate([
            'remediation_plan' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'target_resolution_date' => 'nullable|date',
            'status' => 'required|in:open,in_remediation,resolved,verified_closed',
        ]);

        if ($request->status === 'resolved' || $request->status === 'verified_closed') {
            $finding->resolved_at = now();
        }

        $finding->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Remediation finding updated.',
            'finding' => $finding,
        ]);
    }

    /**
     * Upload evidence to evidence vault.
     */
    public function uploadEvidence(Request $request, string $projectId): JsonResponse
    {
        $project = AuditProject::findOrFail($projectId);

        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max
            'file_title' => 'required|string|max:255',
            'checklist_item_id' => 'nullable|uuid',
        ]);

        $file = $request->file('file');
        $tenantId = app('current_tenant_id');
        $fileName = Str::slug($request->file_title) . '-' . time() . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs("tenants/{$tenantId}/audits/{$project->id}", $fileName, 'local');

        $evidence = AuditEvidence::create([
            'audit_project_id' => $project->id,
            'checklist_item_id' => $request->checklist_item_id,
            'file_title' => $request->file_title,
            'file_path' => $filePath,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evidence document securely deposited into the audit vault.',
            'evidence' => $evidence,
        ], 201);
    }

    /**
     * DPCO Partner sign-off and NDPC certification.
     */
    public function certifyAudit(Request $request, string $projectId): JsonResponse
    {
        $project = AuditProject::findOrFail($projectId);
        $user = $request->user();

        $request->validate([
            'executive_summary' => 'required|string',
            'dpco_seal_code' => 'required|string',
        ]);

        $project->executive_summary = $request->executive_summary;
        $project->dpco_seal_code = $request->dpco_seal_code;
        $project->status = 'dpco_certified';
        $project->certified_at = now();
        $project->save();

        return response()->json([
            'success' => true,
            'message' => 'Audit project successfully certified by Licensed DPCO Firm.',
            'project' => $project,
        ]);
    }

    /**
     * Generate official NDPC Statutory Audit Filing Report.
     */
    public function generateReport(string $projectId)
    {
        $project = AuditProject::with([
            'tenant',
            'dpcoFirm',
            'leadAuditor',
            'checklistItems',
            'findings',
            'evidences'
        ])->findOrFail($projectId);

        $html = view('reports.ndpc_audit_report', [
            'project' => $project,
            'tenant' => $project->tenant,
            'dpco' => $project->dpcoFirm,
            'checklist' => $project->checklistItems->groupBy('domain'),
            'findings' => $project->findings,
            'evidences' => $project->evidences,
            'generatedAt' => now()->format('d F Y, H:i T'),
        ])->render();

        $pdf = Pdf::loadHTML($html)->setPaper('a4', 'portrait');

        return $pdf->download("NDPC_Statutory_Audit_Report_{$project->tenant->slug}_{$project->audit_year}.pdf");
    }
}
