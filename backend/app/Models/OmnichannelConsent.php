<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OmnichannelConsent extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'data_subject_identifier',
        'channel',
        'channel_session_ref',
        'raw_payload',
        'consent_categories',
        'proof_hash',
        'ip_address',
        'opt_in_timestamp',
        'is_withdrawn',
        'withdrawn_at',
    ];

    protected $casts = [
        'raw_payload' => 'array',
        'consent_categories' => 'array',
        'is_withdrawn' => 'boolean',
        'opt_in_timestamp' => 'datetime',
        'withdrawn_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
