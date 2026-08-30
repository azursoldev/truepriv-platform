<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataControllerClassification extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'calculated_tier',
        'criteria_evaluated',
        'annual_filing_fee_applicable',
        'mandatory_dpo_required',
        'statutory_audit_mandatory',
    ];

    protected $casts = [
        'criteria_evaluated' => 'array',
        'annual_filing_fee_applicable' => 'decimal:2',
        'mandatory_dpo_required' => 'boolean',
        'statutory_audit_mandatory' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
