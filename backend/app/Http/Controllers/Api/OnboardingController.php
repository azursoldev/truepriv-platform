<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\DataControllerClassification;
use App\Models\OnboardingAnswer;
use App\Models\OnboardingQuestion;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /**
     * Get baseline NDPA readiness onboarding questions.
     */
    public function getQuestions(): JsonResponse
    {
        $questions = OnboardingQuestion::orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'count' => $questions->count(),
            'data' => $questions,
        ]);
    }

    /**
     * Submit readiness assessment and calculate MDC classification tier under NDPA Section 48.
     */
    public function submitAnswers(Request $request): JsonResponse
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|uuid|exists:onboarding_questions,id',
            'answers.*.response_choice' => 'required|in:yes,no,partial,in_progress,not_applicable',
            'answers.*.evidence_notes' => 'nullable|string',
            'annual_data_subjects' => 'nullable|integer|min:0',
            'processes_special_pii' => 'nullable|boolean',
            'is_critical_infrastructure' => 'nullable|boolean',
        ]);

        $tenantId = app('current_tenant_id');
        $tenant = Tenant::findOrFail($tenantId);
        $user = $request->user();

        $totalPossiblePoints = 0;
        $earnedPoints = 0;

        foreach ($request->answers as $item) {
            $question = OnboardingQuestion::find($item['question_id']);
            if (!$question) continue;

            $totalPossiblePoints += $question->weight_points;

            $scoreMultiplier = 0.0;
            if ($item['response_choice'] === 'yes') {
                $scoreMultiplier = 1.0;
            } elseif ($item['response_choice'] === 'partial' || $item['response_choice'] === 'in_progress') {
                $scoreMultiplier = 0.5;
            }

            $earnedPoints += ($question->weight_points * $scoreMultiplier);

            OnboardingAnswer::updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'question_id' => $item['question_id'],
                ],
                [
                    'response_choice' => $item['response_choice'],
                    'evidence_notes' => $item['evidence_notes'] ?? null,
                    'answered_by_user_id' => $user->id,
                ]
            );
        }

        // Calculate Initial Compliance Readiness Score Percentage
        $readinessScore = $totalPossiblePoints > 0 
            ? round(($earnedPoints / $totalPossiblePoints) * 100, 1) 
            : 75.0;

        // Determine Major Data Controller (MDC) Classification Tier (NDPA Section 48 & GAID)
        $dataSubjects = (int) ($request->annual_data_subjects ?? 50000);
        $specialPii = (bool) ($request->processes_special_pii ?? false);
        $criticalInfra = (bool) ($request->is_critical_infrastructure ?? false);

        if ($dataSubjects >= 250000 || ($criticalInfra && $dataSubjects >= 50000)) {
            $mdcTier = 'mdc_extra_high';
            $registrationFee = '₦250,000';
            $filingRequirement = 'Mandatory Annual NDPC Audit by March 15 + Dedicated Certified DPO Registration';
        } elseif ($dataSubjects >= 50000 || $specialPii) {
            $mdcTier = 'mdc_high';
            $registrationFee = '₦100,000';
            $filingRequirement = 'Mandatory Annual NDPC Audit by March 15 + DPO Appointment';
        } elseif ($dataSubjects >= 10000) {
            $mdcTier = 'mdc_medium';
            $registrationFee = '₦50,000';
            $filingRequirement = 'Annual Summary Return to NDPC';
        } else {
            $mdcTier = 'non_mdc';
            $registrationFee = '₦0';
            $filingRequirement = 'Standard NDPA Principle Adherence';
        }

        // Update Tenant Compliance Score & Profile
        $tenant->update([
            'compliance_score' => $readinessScore,
        ]);

        CompanyProfile::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'mdc_classification_tier' => $mdcTier,
                'annual_data_subjects_processed' => $dataSubjects,
            ]
        );

        DataControllerClassification::create([
            'tenant_id' => $tenantId,
            'annual_data_subjects_count' => $dataSubjects,
            'processes_biometric_kyc' => $specialPii,
            'operates_critical_infrastructure' => $criticalInfra,
            'sector' => $tenant->industry ?? 'Financial Services',
            'classification_tier' => $mdcTier,
            'annual_ndpc_filing_deadline' => 'March 15',
            'requires_certified_dpco' => in_array($mdcTier, ['mdc_high', 'mdc_extra_high']),
            'assessment_raw_payload' => [
                'earned_points' => $earnedPoints,
                'total_points' => $totalPossiblePoints,
                'answers_count' => count($request->answers),
                'assessed_at' => now()->toIso8601String(),
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Onboarding assessment completed successfully.',
            'data' => [
                'readiness_score' => $readinessScore,
                'mdc_tier' => $mdcTier,
                'registration_fee' => $registrationFee,
                'filing_requirement' => $filingRequirement,
                'next_audit_deadline' => 'March 15, 2027',
            ],
        ]);
    }

    /**
     * Get active tenant classification and statutory compliance profile.
     */
    public function getClassification(): JsonResponse
    {
        $tenantId = app('current_tenant_id');
        $classification = DataControllerClassification::where('tenant_id', $tenantId)->latest()->first();
        $companyProfile = CompanyProfile::where('tenant_id', $tenantId)->first();
        $tenant = Tenant::find($tenantId);

        return response()->json([
            'success' => true,
            'data' => [
                'tenant_name' => $tenant ? $tenant->name : 'Unknown',
                'compliance_score' => $tenant ? $tenant->compliance_score : 78.5,
                'mdc_tier' => $companyProfile ? $companyProfile->mdc_classification_tier : ($classification ? $classification->classification_tier : 'mdc_high'),
                'annual_data_subjects' => $companyProfile ? $companyProfile->annual_data_subjects_processed : 50000,
                'filing_deadline' => 'March 15',
                'requires_certified_dpco' => true,
                'latest_assessment' => $classification,
            ],
        ]);
    }
}
