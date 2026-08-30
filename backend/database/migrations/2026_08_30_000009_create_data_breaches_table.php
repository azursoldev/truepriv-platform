<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_breaches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('incident_number')->unique(); // e.g. INC-2026-0043
            $table->string('title');
            $table->enum('nature_of_incident', [
                'unauthorized_access',
                'ransomware_malware',
                'lost_stolen_device',
                'accidental_disclosure_email',
                'insider_threat',
                'phishing_credential_theft',
                'physical_theft',
                'misconfigured_cloud_bucket',
                'other'
            ]);
            $table->timestamp('date_time_occurred')->nullable();
            $table->timestamp('date_time_discovered')->useCurrent();
            $table->timestamp('ndpc_notification_deadline')->nullable(); // 72 hours from discovery (NDPA Sec 40)
            $table->integer('estimated_affected_subjects')->default(0);
            $table->json('compromised_data_categories'); // e.g. ["Full Name", "Bank Account Details", "BVN/NIN", "Passwords"]
            $table->enum('risk_assessment_level', [
                'low',
                'medium',
                'high_to_rights_freedoms',
                'critical_systemic'
            ])->default('medium');
            $table->boolean('is_ndpc_notified')->default(false);
            $table->timestamp('ndpc_notified_at')->nullable();
            $table->string('ndpc_reference_number')->nullable();
            $table->boolean('are_subjects_notified')->default(false);
            $table->timestamp('subjects_notified_at')->nullable();
            $table->text('containment_steps_taken')->nullable();
            $table->text('remedial_measures')->nullable();
            $table->text('root_cause_analysis')->nullable();
            $table->enum('status', [
                'reported_triage',
                'investigation',
                'containment_remediation',
                'ndpc_notified',
                'closed'
            ])->default('reported_triage');
            $table->unsignedBigInteger('lead_responder_id')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('lead_responder_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['tenant_id', 'status', 'ndpc_notification_deadline'], 'breach_tenant_status_sla_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_breaches');
    }
};
