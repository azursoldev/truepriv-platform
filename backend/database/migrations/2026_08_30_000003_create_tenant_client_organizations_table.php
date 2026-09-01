<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_client_organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_tenant_id'); // The DPCO Firm or Outsourced DPO tenant
            $table->uuid('client_tenant_id'); // The Corporate Client tenant
            $table->string('contract_ref')->nullable();
            $table->enum('service_scope', [
                'annual_audit_filing',
                'full_dpo_as_a_service',
                'advisory_gap_assessment',
                'incident_response_support'
            ])->default('annual_audit_filing');
            $table->foreignUuid('assigned_lead_auditor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['active', 'pending_approval', 'completed', 'suspended'])->default('active');
            $table->date('engagement_start_date')->nullable();
            $table->date('engagement_end_date')->nullable();
            $table->timestamps();

            $table->foreign('parent_tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('client_tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            $table->unique(['parent_tenant_id', 'client_tenant_id'], 'tco_parent_client_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_client_organizations');
    }
};
