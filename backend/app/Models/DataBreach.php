<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataBreach extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'incident_number',
        'title',
        'nature_of_incident',
        'date_time_occurred',
        'date_time_discovered',
        'ndpc_notification_deadline',
        'estimated_affected_subjects',
        'compromised_data_categories',
        'risk_assessment_level',
        'is_ndpc_notified',
        'ndpc_notified_at',
        'ndpc_reference_number',
        'are_subjects_notified',
        'subjects_notified_at',
        'containment_steps_taken',
        'remedial_measures',
        'root_cause_analysis',
        'status',
        'lead_responder_id',
    ];

    protected $casts = [
        'date_time_occurred' => 'datetime',
        'date_time_discovered' => 'datetime',
        'ndpc_notification_deadline' => 'datetime',
        'estimated_affected_subjects' => 'integer',
        'compromised_data_categories' => 'array',
        'is_ndpc_notified' => 'boolean',
        'ndpc_notified_at' => 'datetime',
        'are_subjects_notified' => 'boolean',
        'subjects_notified_at' => 'datetime',
    ];

    public function leadResponder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_responder_id');
    }

    /**
     * Compute remaining hours for the mandatory 72-hour NDPC notification clock.
     */
    public function getHoursRemainingAttribute(): float
    {
        if ($this->is_ndpc_notified || !$this->ndpc_notification_deadline) {
            return 0.0;
        }

        $diffMinutes = now()->diffInMinutes($this->ndpc_notification_deadline, false);
        return round($diffMinutes / 60, 1);
    }
}
