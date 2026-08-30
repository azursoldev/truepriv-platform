<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Corporate Company Profiles
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->unique()->constrained('tenants')->cascadeOnDelete();
            $table->string('cac_rc_number', 50)->nullable();
            $table->string('tax_identification_number', 50)->nullable();
            $table->string('sector', 100)->nullable();
            $table->string('data_protection_officer_name', 255)->nullable();
            $table->string('data_protection_officer_email', 255)->nullable();
            $table->enum('mdc_classification_tier', ['non_mdc', 'mdc_medium', 'mdc_high', 'mdc_extra_high'])->default('non_mdc');
            $table->string('employee_count_bracket', 50)->nullable();
            $table->integer('annual_data_subjects_processed')->default(0);
            $table->text('registered_office_address')->nullable();
            $table->timestamps();
        });

        // 2. Outsourced DPO Profiles
        Schema::create('dpo_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->unique()->constrained('tenants')->cascadeOnDelete();
            $table->string('lead_consultant_name', 255);
            $table->string('lead_consultant_email', 255);
            $table->json('professional_certifications')->nullable();
            $table->string('consulting_tier', 50)->default('standard');
            $table->integer('active_client_capacity')->default(10);
            $table->timestamps();
        });

        // 3. Licensed DPCO Profiles
        Schema::create('dpco_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->unique()->constrained('tenants')->cascadeOnDelete();
            $table->string('ndpc_license_number', 100)->unique();
            $table->string('managing_partner_name', 255);
            $table->string('managing_partner_email', 255);
            $table->year('accreditation_year')->nullable();
            $table->string('digital_seal_signature_hash', 255)->nullable();
            $table->enum('license_status', ['active', 'suspended', 'under_renewal'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dpco_profiles');
        Schema::dropIfExists('dpo_profiles');
        Schema::dropIfExists('company_profiles');
    }
};
