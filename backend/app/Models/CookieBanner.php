<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CookieBanner extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'domain',
        'theme_color',
        'position',
        'privacy_policy_url',
        'company_display_name',
        'custom_notice_text',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
