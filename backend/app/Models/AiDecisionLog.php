<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiDecisionLog extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'decision_type',
        'model_name',
        'prompt_tokens',
        'completion_tokens',
        'confidence_score',
        'input_payload',
        'ai_output_payload',
        'human_override_status',
        'human_override_rationale',
        'ledger_hash',
    ];

    protected $casts = [
        'confidence_score' => 'decimal:2',
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
        'input_payload' => 'array',
        'ai_output_payload' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
