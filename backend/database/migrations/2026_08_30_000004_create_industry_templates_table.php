<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('industry_templates', function (Blueprint $table) {
            $table->id();
            $table->string('industry_name'); // e.g. Fintech & Payments, Commercial Banking, Healthcare, E-Commerce, Telecoms, EduTech, Logistics
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->json('default_ropa'); // Pre-configured array of RoPA processing activities
            $table->json('default_dpia_triggers')->nullable(); // High-risk trigger rules
            $table->json('default_policies')->nullable(); // Policy starter packs
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('industry_templates');
    }
};
