<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestInvitation extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'invited_by_user_id',
        'email',
        'assigned_role',
        'target_department',
        'invitation_token',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    protected $appends = ['status', 'department_assigned'];

    public function getStatusAttribute(): string
    {
        if ($this->accepted_at) {
            return 'accepted';
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'expired';
        }
        return 'pending';
    }

    public function getDepartmentAssignedAttribute(): ?string
    {
        return $this->target_department;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }
}
