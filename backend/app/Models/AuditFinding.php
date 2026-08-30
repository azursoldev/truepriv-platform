<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditFinding extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'audit_project_id',
        'checklist_item_id',
        'title',
        'description',
        'severity',
        'recommendation',
        'remediation_plan',
        'assigned_to',
        'target_resolution_date',
        'resolved_at',
        'status',
    ];

    protected $casts = [
        'target_resolution_date' => 'date',
        'resolved_at' => 'datetime',
    ];

    public function auditProject(): BelongsTo
    {
        return $this->belongsTo(AuditProject::class);
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(AuditChecklistItem::class, 'checklist_item_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
