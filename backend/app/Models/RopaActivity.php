<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RopaActivity extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'process_name',
        'department',
        'business_purpose',
        'legal_basis',
        'legal_basis_rationale',
        'data_subject_categories',
        'personal_data_elements',
        'special_category_data',
        'recipients',
        'has_third_party_processor',
        'third_party_names',
        'cross_border_transfer',
        'transfer_destination_countries',
        'transfer_safeguards',
        'storage_location',
        'retention_period',
        'security_measures',
        'requires_dpia',
        'status',
        'reviewed_by',
        'approved_at',
    ];

    protected $casts = [
        'data_subject_categories' => 'array',
        'personal_data_elements' => 'array',
        'special_category_data' => 'boolean',
        'recipients' => 'array',
        'has_third_party_processor' => 'boolean',
        'third_party_names' => 'array',
        'cross_border_transfer' => 'boolean',
        'transfer_destination_countries' => 'array',
        'requires_dpia' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function dpiaAssessments(): HasMany
    {
        return $this->hasMany(DpiaAssessment::class, 'ropa_id');
    }
}
