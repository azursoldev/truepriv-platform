<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['corporate', 'outsourced_dpo', 'dpco_firm'])->default('corporate');
            $table->string('industry')->nullable(); // e.g. Fintech, Healthcare, Banking, E-Commerce
            $table->string('rc_number')->nullable(); // CAC Nigeria registration number
            $table->string('ndpc_registration_number')->nullable(); // NDPC Data Controller registration
            $table->string('dpco_license_number')->nullable(); // For Licensed DPCO Firms
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('address')->nullable();
            $table->string('state')->nullable(); // Lagos, Abuja FCT, Rivers, etc.
            $table->decimal('compliance_score', 5, 2)->default(0.00); // 0.00 to 100.00%
            $table->json('settings')->nullable(); // Custom branding, colors, notification preferences
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
