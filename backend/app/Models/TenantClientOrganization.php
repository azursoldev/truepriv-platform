<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantClientOrganization extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'parent_tenant_id',
        'client_tenant_id',
        'contract_ref',
        'service_scope',
        'assigned_lead_auditor_id',
        'status',
        'engagement_start_date',
        'engagement_end_date',
    ];

    protected $casts = [
        'engagement_start_date' => 'date',
        'engagement_end_date' => 'date',
    ];

    public function parentTenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'parent_tenant_id');
    }

    public function clientTenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'client_tenant_id');
    }

    public function leadAuditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_lead_auditor_id');
    }
}
