<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DsarRequest extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'ticket_number',
        'request_type',
        'data_subject_name',
        'data_subject_email',
        'data_subject_phone',
        'subject_relationship',
        'request_details',
        'id_document_path',
        'id_verified',
        'sla_deadline',
        'status',
        'response_summary',
        'rejection_reason',
        'assigned_dpo_id',
        'completed_at',
    ];

    protected $casts = [
        'id_verified' => 'boolean',
        'sla_deadline' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function assignedDpo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_dpo_id');
    }

    /**
     * Compute remaining days until NDPA 30-day statutory SLA deadline.
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->sla_deadline || $this->status === 'completed' || $this->status === 'rejected') {
            return 0;
        }

        return max(0, (int) now()->diffInDays($this->sla_deadline, false));
    }
}
