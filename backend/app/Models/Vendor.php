<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'vendor_name',
        'service_category',
        'contact_person',
        'contact_email',
        'contact_phone',
        'data_types_processed',
        'dpa_signed',
        'dpa_signed_date',
        'dpa_file_path',
        'risk_rating',
        'hosting_country',
        'is_cross_border',
        'last_assessment_date',
        'status',
    ];

    protected $casts = [
        'data_types_processed' => 'array',
        'dpa_signed' => 'boolean',
        'dpa_signed_date' => 'date',
        'is_cross_border' => 'boolean',
        'last_assessment_date' => 'date',
    ];
}
