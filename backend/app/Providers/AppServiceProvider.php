<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1. Register Laravel Model Authorization Policies (Milestone 3)
        \Illuminate\Support\Facades\Gate::policy(\App\Models\RopaActivity::class, \App\Policies\RopaActivityPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\DpiaAssessment::class, \App\Policies\DpiaAssessmentPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\DataBreach::class, \App\Policies\DataBreachPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\AuditProject::class, \App\Policies\AuditProjectPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\GuestInvitation::class, \App\Policies\GuestInvitationPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);

        // 2. Global Authorization Gates
        \Illuminate\Support\Facades\Gate::define('manage-tenant-security', function ($user) {
            return in_array($user->role, ['super_admin', 'corporate_admin']);
        });

        \Illuminate\Support\Facades\Gate::define('certify-audits', function ($user) {
            return in_array($user->role, ['super_admin', 'dpco_lead_auditor']);
        });

        // 3. Enforce 30-minute idle inactivity timeout on Sanctum Bearer tokens
        Sanctum::authenticateAccessTokensUsing(function ($accessToken, $isValid) {
            if (!$isValid) {
                return false;
            }

            // Check if token has been idle for more than 30 minutes
            if ($accessToken->last_used_at && $accessToken->last_used_at->lt(now()->subMinutes(30))) {
                return false;
            }

            return true;
        });
    }
}
