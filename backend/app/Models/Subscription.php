<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'plan_tier',
        'billing_cycle',
        'price_ngn',
        'status',
        'current_period_start',
        'current_period_end',
    ];

    protected $casts = [
        'price_ngn' => 'decimal:2',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->current_period_end && $this->current_period_end->isPast());
    }

    public function isInGracePeriod(): bool
    {
        if ($this->status === 'grace_period') return true;
        if ($this->isExpired() && $this->current_period_end) {
            return $this->current_period_end->diffInDays(now()) <= 7;
        }
        return false;
    }

    public function daysRemaining(): int
    {
        if (!$this->current_period_end) return 0;
        return max(0, (int) now()->diffInDays($this->current_period_end, false));
    }
}
