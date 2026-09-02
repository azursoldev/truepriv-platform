<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreachPlaybookStep extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'data_breach_id',
        'step_code',
        'step_name',
        'status',
        'executed_by_user_id',
        'atomic_started_at',
        'atomic_completed_at',
        'playbook_output_data',
        'notes',
    ];

    protected $casts = [
        'atomic_started_at' => 'datetime',
        'atomic_completed_at' => 'datetime',
        'playbook_output_data' => 'array',
    ];

    public function dataBreach(): BelongsTo
    {
        return $this->belongsTo(DataBreach::class, 'data_breach_id');
    }

    public function executedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by_user_id');
    }
}
