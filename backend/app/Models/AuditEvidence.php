<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditEvidence extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'audit_evidences';

    protected $fillable = [
        'audit_project_id',
        'checklist_item_id',
        'file_title',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function auditProject(): BelongsTo
    {
        return $this->belongsTo(AuditProject::class);
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(AuditChecklistItem::class, 'checklist_item_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
