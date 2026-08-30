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
        'industry',
        'rc_number',
        'ndpc_registration_number',
        'dpco_license_number',
        'contact_email',
        'contact_phone',
        'address',
        'state',
        'compliance_score',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
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
}
