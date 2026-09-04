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
        // (vi) Cross-Border Transfer Tracker (NDPC Section 41)
        Schema::create('cross_border_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('ropa_activity_id')->nullable()->constrained('ropa_activities')->nullOnDelete();
            $table->string('destination_country_code', 2); // ISO 3166-1 alpha-2 standard, e.g. 'NG', 'KE', 'BR', 'US', 'GB'
            $table->string('destination_country_name', 100);
            $table->string('recipient_entity_name', 255);
            $table->enum('recipient_entity_type', ['sub_processor', 'joint_controller', 'group_affiliate', 'public_authority'])
                ->default('sub_processor');
            $table->enum('ndpc_transfer_mechanism', [
                'adequacy_decision',
                'standard_contractual_clauses_scc',
                'binding_corporate_rules_bcr',
                'explicit_consent_derogation',
                'statutory_public_interest'
            ])->default('standard_contractual_clauses_scc');
            $table->string('safeguard_documentation_ref', 255)->nullable();
            $table->integer('annual_transfer_volume_estimate')->default(0);
            $table->string('encryption_in_transit_standard', 100)->default('TLS 1.3 / AES-256');
            $table->timestamps();

            $table->index(['tenant_id', 'destination_country_code'], 'cb_tenant_country_idx');
        });

        // (vii) 72-Hour Breach Playbook Execution Steps (Atomic Timestamps)
        Schema::create('breach_playbook_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('data_breach_id')->constrained('data_breaches')->cascadeOnDelete();
            $table->string('step_code', 50); // e.g. 'ISOLATE_SYSTEMS', 'ASSESS_RIGHTS_IMPACT', 'DRAFT_NDPC_FORM1'
            $table->string('step_name', 255);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'skipped'])->default('pending');
            $table->foreignUuid('executed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('atomic_started_at')->nullable();
            $table->timestamp('atomic_completed_at')->nullable();
            $table->json('playbook_output_data')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['data_breach_id', 'step_code'], 'breach_step_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breach_playbook_steps');
        Schema::dropIfExists('cross_border_transfers');
    }
};
