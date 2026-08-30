<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CookieConsent extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'visitor_uuid',
        'accepted_categories',
        'ip_hash',
        'user_agent',
        'consented_at',
    ];

    protected $casts = [
        'accepted_categories' => 'array',
        'consented_at' => 'datetime',
    ];
}
