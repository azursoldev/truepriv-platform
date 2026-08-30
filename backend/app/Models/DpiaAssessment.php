<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DpiaAssessment extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'ropa_id',
        'title',
        'description',
        'high_risk_reasons',
        'nature_of_processing',
        'necessity_proportionality_check',
        'inherent_likelihood',
        'inherent_impact',
        'inherent_risk_score',
        'inherent_risk_level',
        'mitigation_measures',
        'residual_likelihood',
        'residual_impact',
        'residual_risk_score',
        'residual_risk_level',
        'dpo_recommendations',
        'dpo_sign_off_status',
        'dpco_review_notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'high_risk_reasons' => 'array',
        'mitigation_measures' => 'array',
        'inherent_likelihood' => 'integer',
        'inherent_impact' => 'integer',
        'inherent_risk_score' => 'integer',
        'residual_likelihood' => 'integer',
        'residual_impact' => 'integer',
        'residual_risk_score' => 'integer',
        'approved_at' => 'datetime',
    ];

    public function ropaActivity(): BelongsTo
    {
        return $this->belongsTo(RopaActivity::class, 'ropa_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
