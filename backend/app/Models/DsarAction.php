<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DsarAction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'dsar_request_id',
        'performed_by_user_id',
        'action_type',
        'action_notes',
    ];

    public function dsarRequest(): BelongsTo
    {
        return $this->belongsTo(DsarRequest::class, 'dsar_request_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by_user_id');
    }
}
