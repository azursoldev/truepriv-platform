<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingQuestion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'category',
        'question_text',
        'explanation_guide',
        'weight_points',
        'is_mandatory',
        'display_order',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'weight_points' => 'integer',
        'display_order' => 'integer',
    ];

    public function answers(): HasMany
    {
        return $this->hasMany(OnboardingAnswer::class, 'question_id');
    }
}
