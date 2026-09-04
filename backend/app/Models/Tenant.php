<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'parent_tenant_id',
        'tenant_tier',
        'industry',
        'rc_number',
        'ndpc_registration_number',
        'dpco_license_number',
        'contact_email',
        'contact_phone',
        'address',
        'state',
        'data_residency',
        'compliance_score',
        'feature_flags',
        'data_subject_quota',
        'monthly_dsar_limit',
        'monthly_breach_limit',
        'usage_metrics',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'feature_flags' => 'array',
        'usage_metrics' => 'array',
        'data_subject_quota' => 'integer',
        'monthly_dsar_limit' => 'integer',
        'monthly_breach_limit' => 'integer',
        'compliance_score' => 'float',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function ropaActivities(): HasMany
    {
        return $this->hasMany(RopaActivity::class);
    }

    public function dpiaAssessments(): HasMany
    {
        return $this->hasMany(DpiaAssessment::class);
    }

    public function auditProjects(): HasMany
    {
        return $this->hasMany(AuditProject::class);
    }

    public function dsarRequests(): HasMany
    {
        return $this->hasMany(DsarRequest::class);
    }

    public function dataBreaches(): HasMany
    {
        return $this->hasMany(DataBreach::class);
    }

    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class);
    }

    public function cookieBanners(): HasMany
    {
        return $this->hasMany(CookieBanner::class);
    }

    public function cookieConsents(): HasMany
    {
        return $this->hasMany(CookieConsent::class);
    }

    public function policies(): HasMany
    {
        return $this->hasMany(Policy::class);
    }

    public function companyProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function dpoProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(DpoProfile::class);
    }

    public function dpcoProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(DpcoProfile::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function classifications(): HasMany
    {
        return $this->hasMany(DataControllerClassification::class);
    }

    public function guestInvitations(): HasMany
    {
        return $this->hasMany(GuestInvitation::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Monetization & Tier Enforcement Guards
     */
    public function canExportReports(): bool
    {
        $sub = $this->subscriptions()->latest()->first();
        if (!$sub || $sub->status === 'trialing') {
            return false; // Trial tier users can view templates in UI but cannot export official PDF/CSV files
        }
        return in_array($sub->status, ['active', 'past_due']);
    }

    public function getMaxVendorsAllowed(): int
    {
        $sub = $this->subscriptions()->latest()->first();
        if (!$sub || $sub->status === 'trialing' || $sub->plan_tier === 'trial') {
            return 3; // Restrict starter trial to max 3 vendors
        }
        return 999999;
    }

    public function getMaxWorkspacesAllowed(): int
    {
        $sub = $this->subscriptions()->latest()->first();
        if (!$sub || $sub->status === 'trialing' || $sub->plan_tier === 'corporate_starter') {
            return 1; // Restrict starter trial to max 1 workspace
        }
        if ($sub->plan_tier === 'dpo_hub') {
            return 15;
        }
        return 999999; // Unlimited for DPCO Suite
    }

    /**
     * If this tenant is a DPCO firm or Outsourced DPO, get managed client organizations.
     */
    public function clientEngagements(): HasMany
    {
        return $this->hasMany(TenantClientOrganization::class, 'parent_tenant_id');
    }

    /**
     * If this tenant is a Corporate client, get managing DPCO / DPO firms.
     */
    public function managingFirms(): HasMany
    {
        return $this->hasMany(TenantClientOrganization::class, 'client_tenant_id');
    }

    /**
     * Check if tenant has an entitled active paid subscription to export official compliance reports (PDF/CSV).
     * Starter / Trial tiers cannot trigger official compliance report exports.
     */
    public function canExportComplianceReports(): bool
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->whereIn('plan_tier', ['growth_enterprise', 'dpo_unlimited', 'dpco_audit_suite'])
            ->exists();
    }

    /**
     * Resolve the active database connection name for this tenant based on data residency.
     */
    public function getDatabaseConnection(): string
    {
        // When dual residency is disabled, always route to local_nigeria connection
        if (!config('residency.enabled', false)) {
            return config('residency.default_residency', 'local_nigeria');
        }

        return $this->data_residency === 'global_aws' ? 'global_aws' : 'local_nigeria';
    }

    /**
     * Check if a feature flag is enabled for this tenant.
     */
    public function hasFeatureFlag(string $flag): bool
    {
        $flags = $this->feature_flags ?? [];
        return in_array($flag, $flags);
    }

    /**
     * Check if tenant has exceeded their allocated data subject quota.
     */
    public function isDataSubjectQuotaExceeded(int $currentCount): bool
    {
        $quota = $this->data_subject_quota ?? 50000;
        return $currentCount > $quota;
    }
}
