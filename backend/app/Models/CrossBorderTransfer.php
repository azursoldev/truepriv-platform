<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrossBorderTransfer extends Model
{
    use HasFactory, HasUuids, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'ropa_activity_id',
        'destination_country_code',
        'destination_country_name',
        'recipient_entity_name',
        'recipient_entity_type',
        'ndpc_transfer_mechanism',
        'safeguard_documentation_ref',
        'annual_transfer_volume_estimate',
        'encryption_in_transit_standard',
    ];

    protected $casts = [
        'annual_transfer_volume_estimate' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function ropaActivity(): BelongsTo
    {
        return $this->belongsTo(RopaActivity::class, 'ropa_activity_id');
    }
}
