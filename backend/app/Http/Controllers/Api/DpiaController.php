<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DpiaAssessment;
use App\Models\RopaActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DpiaController extends Controller
{
    /**
     * List all DPIAs for active tenant.
     */
    public function index(): JsonResponse
    {
        $assessments = DpiaAssessment::with(['ropaActivity', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $assessments->count(),
            'data' => $assessments,
        ]);
    }

    /**
     * Store new DPIA Assessment with automated risk matrix calculation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ropa_id' => 'nullable|uuid',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'high_risk_reasons' => 'required|array',
            'nature_of_processing' => 'nullable|string',
            'necessity_proportionality_check' => 'nullable|string',
            'inherent_likelihood' => 'required|integer|min:1|max:5',
            'inherent_impact' => 'required|integer|min:1|max:5',
            'mitigation_measures' => 'nullable|array',
            'residual_likelihood' => 'required|integer|min:1|max:5',
            'residual_impact' => 'required|integer|min:1|max:5',
            'dpo_recommendations' => 'nullable|string',
        ]);

        // Calculate Inherent Risk
        $inherentScore = $validated['inherent_likelihood'] * $validated['inherent_impact'];
        $inherentLevel = $this->resolveRiskLevel($inherentScore);

        // Calculate Residual Risk
        $residualScore = $validated['residual_likelihood'] * $validated['residual_impact'];
        $residualLevel = $this->resolveRiskLevel($residualScore);

        $assessment = DpiaAssessment::create([
            'tenant_id' => app('current_tenant_id'),
            'ropa_id' => $validated['ropa_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'high_risk_reasons' => $validated['high_risk_reasons'],
            'nature_of_processing' => $validated['nature_of_processing'] ?? null,
            'necessity_proportionality_check' => $validated['necessity_proportionality_check'] ?? null,
            'inherent_likelihood' => $validated['inherent_likelihood'],
            'inherent_impact' => $validated['inherent_impact'],
            'inherent_risk_score' => $inherentScore,
            'inherent_risk_level' => $inherentLevel,
            'mitigation_measures' => $validated['mitigation_measures'] ?? [],
            'residual_likelihood' => $validated['residual_likelihood'],
            'residual_impact' => $validated['residual_impact'],
            'residual_risk_score' => $residualScore,
            'residual_risk_level' => $residualLevel,
            'dpo_recommendations' => $validated['dpo_recommendations'] ?? null,
            'dpo_sign_off_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'DPIA assessment created successfully.',
            'data' => $assessment,
        ], 201);
    }

    /**
     * DPO / DPCO Sign-off on DPIA.
     */
    public function signOff(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,requires_consultation_ndpc,rejected',
            'dpo_recommendations' => 'nullable|string',
            'dpco_review_notes' => 'nullable|string',
        ]);

        $assessment = DpiaAssessment::findOrFail($id);
        $user = $request->user();

        $assessment->dpo_sign_off_status = $request->status;
        if ($request->has('dpo_recommendations')) {
            $assessment->dpo_recommendations = $request->dpo_recommendations;
        }
        if ($request->has('dpco_review_notes')) {
            $assessment->dpco_review_notes = $request->dpco_review_notes;
        }

        if ($request->status === 'approved') {
            $assessment->approved_by = $user->id;
            $assessment->approved_at = now();
        }

        $assessment->save();

        return response()->json([
            'success' => true,
            'message' => "DPIA sign-off status updated to {$request->status}.",
            'data' => $assessment,
        ]);
    }

    /**
     * Helper to resolve risk score to risk level.
     */
    private function resolveRiskLevel(int $score): string
    {
        if ($score >= 16) return 'critical';
        if ($score >= 10) return 'high';
        if ($score >= 6) return 'medium';
        return 'low';
    }
}
