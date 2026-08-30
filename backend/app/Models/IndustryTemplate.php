<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndustryTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'industry_name',
        'slug',
        'icon',
        'description',
        'default_ropa',
        'default_dpia_triggers',
        'default_policies',
    ];

    protected $casts = [
        'default_ropa' => 'array',
        'default_dpia_triggers' => 'array',
        'default_policies' => 'array',
    ];
}
