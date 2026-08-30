<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AuditProject extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'dpco_firm_id',
        'lead_auditor_id',
        'audit_year',
        'title',
        'scope_description',
        'overall_score',
        'compliance_level',
        'status',
        'dpco_seal_code',
        'ndpc_acknowledgement_ref',
        'executive_summary',
        'certified_at',
        'filed_at',
    ];

    protected $casts = [
        'audit_year' => 'integer',
        'overall_score' => 'float',
        'certified_at' => 'datetime',
        'filed_at' => 'datetime',
    ];

    public function dpcoFirm(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'dpco_firm_id');
    }

    public function leadAuditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_auditor_id');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(AuditChecklistItem::class);
    }

    public function findings(): HasMany
    {
        return $this->hasMany(AuditFinding::class);
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(AuditEvidence::class);
    }

    /**
     * Recalculate and update overall compliance score dynamically.
     */
    public function recalculateScore(): float
    {
        $items = $this->checklistItems()->where('status', '!=', 'not_applicable')->get();
        if ($items->isEmpty()) {
            $this->overall_score = 0.00;
            $this->compliance_level = 'not_assessed';
            $this->save();
            return 0.00;
        }

        $totalMax = $items->sum('max_points');
        $totalAwarded = $items->sum('awarded_points');
        $percentage = $totalMax > 0 ? round(($totalAwarded / $totalMax) * 100, 2) : 0.00;

        $this->overall_score = $percentage;
        if ($percentage >= 80.00) {
            $this->compliance_level = 'substantially_compliant';
        } elseif ($percentage >= 50.00) {
            $this->compliance_level = 'partially_compliant';
        } else {
            $this->compliance_level = 'non_compliant';
        }

        $this->save();

        // Also update tenant compliance score
        $this->tenant->update(['compliance_score' => $percentage]);

        return $percentage;
    }
}
