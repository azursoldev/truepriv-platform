<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('vendor_name');
            $table->string('service_category'); // e.g. Cloud Hosting, Payment Gateway, CRM SaaS, KYC Provider, Payroll
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->json('data_types_processed'); // e.g. ["Customer BVN", "Card Tokens", "Employee Salaries"]
            $table->boolean('dpa_signed')->default(false); // Data Processing Agreement executed
            $table->date('dpa_signed_date')->nullable();
            $table->string('dpa_file_path')->nullable();
            $table->enum('risk_rating', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('hosting_country')->default('Nigeria'); // e.g. Nigeria, Ireland, USA
            $table->boolean('is_cross_border')->default(false);
            $table->date('last_assessment_date')->nullable();
            $table->enum('status', ['active', 'under_review', 'terminated'])->default('active');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'risk_rating', 'dpa_signed'], 'vendors_tenant_risk_dpa_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
