<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AuditChecklistItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'audit_project_id',
        'domain',
        'section_code',
        'question',
        'guidance',
        'status',
        'max_points',
        'awarded_points',
        'auditor_findings',
        'client_notes',
    ];

    protected $casts = [
        'max_points' => 'integer',
        'awarded_points' => 'float',
    ];

    public function auditProject(): BelongsTo
    {
        return $this->belongsTo(AuditProject::class);
    }

    public function findings(): HasMany
    {
        return $this->hasMany(AuditFinding::class, 'checklist_item_id');
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(AuditEvidence::class, 'checklist_item_id');
    }
}
