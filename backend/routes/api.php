<?php

use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BreachController;
use App\Http\Controllers\Api\CookieController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DpiaController;
use App\Http\Controllers\Api\DsarController;
use App\Http\Controllers\Api\ChampionInvitationController;
use App\Http\Controllers\Api\LocalizationController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\PolicyController;
use App\Http\Controllers\Api\RopaController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\VendorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| DPODPCO Platform REST API Routes (v1)
| Multi-tenant NDPA 2023 Compliance SaaS for Nigeria
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 1. Public Authentication, Feature Flags & Scaffolding Endpoints
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::get('/features', [AuthController::class, 'getFeatures']);
    Route::get('/templates', [TemplateController::class, 'index']);
    Route::get('/templates/{slug}', [TemplateController::class, 'show']);

    // 2. Public Self-Service Endpoints (DSAR Portal, Cookie SDK & Champion Intake)
    Route::post('/public/dsar/submit', [DsarController::class, 'publicSubmit']);
    Route::post('/cookie-consent/log', [CookieController::class, 'logConsent']);
    Route::get('/public/invitations/{token}', [ChampionInvitationController::class, 'resolvePublicToken']);
    Route::post('/public/invitations/{token}/submit', [ChampionInvitationController::class, 'submitDepartmentData']);

    // 3. Authenticated API Routes
    Route::middleware(['auth:sanctum', 'idle_timeout'])->group(function () {

        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Multi-client Portfolio Desk (For Outsourced DPOs & DPCOs)
        Route::get('/dashboard/portfolio', [DashboardController::class, 'portfolio']);

        // 4. Tenant-Scoped Compliance Engine Routes
        Route::middleware('tenant')->group(function () {

            // Executive Dashboard & NDPA Readiness Score
            Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

            // Onboarding & MDC Classification Wizard
            Route::get('/onboarding/questions', [OnboardingController::class, 'getQuestions']);
            Route::post('/onboarding/submit', [OnboardingController::class, 'submitAnswers']);
            Route::get('/onboarding/classification', [OnboardingController::class, 'getClassification']);

            // Department Champion Invitations
            Route::get('/invitations', [ChampionInvitationController::class, 'index']);
            Route::post('/invitations', [ChampionInvitationController::class, 'store']);

            // Dual-Residency Data Localization
            Route::get('/localization/status', [LocalizationController::class, 'getStatus']);
            Route::put('/localization/switch', [LocalizationController::class, 'switchResidency']);

            // RoPA (Record of Processing Activities)
            Route::get('/ropa', [RopaController::class, 'index']);
            Route::post('/ropa', [RopaController::class, 'store']);
            Route::post('/ropa/apply-template', [RopaController::class, 'applyIndustryTemplate']);
            Route::put('/ropa/{id}', [RopaController::class, 'update']);
            Route::put('/ropa/{id}/status', [RopaController::class, 'updateStatus']);
            Route::delete('/ropa/{id}', [RopaController::class, 'destroy']);

            // DPIA (Data Protection Impact Assessment)
            Route::get('/dpia', [DpiaController::class, 'index']);
            Route::post('/dpia', [DpiaController::class, 'store']);
            Route::post('/dpia/{id}/sign-off', [DpiaController::class, 'signOff']);

            // Statutory NDPC Audits & Remediation Tracker
            Route::get('/audits', [AuditController::class, 'index']);
            Route::get('/audits/{id}', [AuditController::class, 'show']);
            Route::put('/audits/checklist/{itemId}', [AuditController::class, 'updateChecklistItem']);
            Route::post('/audits/{id}/findings', [AuditController::class, 'storeFinding']);
            Route::put('/audits/findings/{findingId}', [AuditController::class, 'updateFinding']);
            Route::post('/audits/{id}/evidence', [AuditController::class, 'uploadEvidence']);
            Route::post('/audits/{id}/certify', [AuditController::class, 'certifyAudit']);
            Route::get('/audits/{id}/report', [AuditController::class, 'generateReport']);

            // 30-Day DSAR Request Management
            Route::get('/dsars', [DsarController::class, 'index']);
            Route::put('/dsars/{id}', [DsarController::class, 'updateStatus']);

            // 72-Hour Data Breach Incident Management
            Route::get('/breaches', [BreachController::class, 'index']);
            Route::post('/breaches', [BreachController::class, 'store']);
            Route::post('/breaches/{id}/notify-ndpc', [BreachController::class, 'recordNdpcNotification']);
            Route::get('/breaches/{id}/form1', [BreachController::class, 'generateNdpcForm']);

            // Vendor & Third-Party Processors (TPRM)
            Route::get('/vendors', [VendorController::class, 'index']);
            Route::post('/vendors', [VendorController::class, 'store']);
            Route::put('/vendors/{id}', [VendorController::class, 'update']);
            Route::delete('/vendors/{id}', [VendorController::class, 'destroy']);

            // Cookie Banner Configurator & Proof Logs
            Route::get('/cookies/config', [CookieController::class, 'getBannerConfig']);
            Route::put('/cookies/config', [CookieController::class, 'updateBannerConfig']);
            Route::get('/cookies/analytics', [CookieController::class, 'getAnalytics']);

            // Auto-Generated Policies & Privacy Notices
            Route::get('/policies', [PolicyController::class, 'index']);
            Route::post('/policies/generate', [PolicyController::class, 'generate']);
            Route::put('/policies/{id}', [PolicyController::class, 'update']);

        });

    });

});
