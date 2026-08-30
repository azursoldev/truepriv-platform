<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Main Audit Projects table
        Schema::create('audit_projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id'); // Corporate company being audited
            $table->uuid('dpco_firm_id')->nullable(); // Conducting DPCO firm
            $table->unsignedBigInteger('lead_auditor_id')->nullable();
            $table->integer('audit_year')->default(2026);
            $table->string('title'); // e.g. NDPC Statutory Annual Compliance Audit 2026
            $table->text('scope_description')->nullable();
            $table->decimal('overall_score', 5, 2)->default(0.00); // 0-100%
            $table->enum('compliance_level', [
                'substantially_compliant',
                'partially_compliant',
                'non_compliant',
                'not_assessed'
            ])->default('not_assessed');
            $table->enum('status', [
                'draft',
                'scoping',
                'fieldwork',
                'remediation_in_progress',
                'final_review',
                'dpco_certified',
                'filed_with_ndpc'
            ])->default('draft');
            $table->string('dpco_seal_code')->nullable();
            $table->string('ndpc_acknowledgement_ref')->nullable();
            $table->text('executive_summary')->nullable();
            $table->timestamp('certified_at')->nullable();
            $table->timestamp('filed_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('dpco_firm_id')->references('id')->on('tenants')->onDelete('set null');
            $table->foreign('lead_auditor_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['tenant_id', 'audit_year', 'status']);
        });

        // 2. Audit Checklist Items (NDPC GAID Framework domains)
        Schema::create('audit_checklist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_project_id');
            $table->enum('domain', [
                'governance_accountability',
                'lawfulness_consent',
                'data_subject_rights',
                'security_measures',
                'third_party_processors',
                'cross_border_transfers'
            ]);
            $table->string('section_code'); // e.g. NDPA-S24, GAID-SEC-1.1
            $table->text('question');
            $table->text('guidance')->nullable();
            $table->enum('status', [
                'compliant',
                'partially_compliant',
                'non_compliant',
                'not_applicable',
                'pending_review'
            ])->default('pending_review');
            $table->tinyInteger('max_points')->default(5);
            $table->decimal('awarded_points', 4, 2)->default(0.00);
            $table->text('auditor_findings')->nullable();
            $table->text('client_notes')->nullable();
            $table->timestamps();

            $table->foreign('audit_project_id')->references('id')->on('audit_projects')->onDelete('cascade');
            $table->index(['audit_project_id', 'domain', 'status']);
        });

        // 3. Audit Findings & Non-Conformities Remediation Tracker
        Schema::create('audit_findings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_project_id');
            $table->uuid('checklist_item_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->enum('severity', ['critical', 'high', 'medium', 'low', 'observation'])->default('medium');
            $table->text('recommendation');
            $table->text('remediation_plan')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->date('target_resolution_date')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->enum('status', ['open', 'in_remediation', 'resolved', 'verified_closed'])->default('open');
            $table->timestamps();

            $table->foreign('audit_project_id')->references('id')->on('audit_projects')->onDelete('cascade');
            $table->foreign('checklist_item_id')->references('id')->on('audit_checklist_items')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->index(['audit_project_id', 'severity', 'status']);
        });

        // 4. Audit Evidence Vault
        Schema::create('audit_evidences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_project_id');
            $table->uuid('checklist_item_id')->nullable();
            $table->string('file_title');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable(); // bytes
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();

            $table->foreign('audit_project_id')->references('id')->on('audit_projects')->onDelete('cascade');
            $table->foreign('checklist_item_id')->references('id')->on('audit_checklist_items')->onDelete('set null');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_evidences');
        Schema::dropIfExists('audit_findings');
        Schema::dropIfExists('audit_checklist_items');
        Schema::dropIfExists('audit_projects');
    }
};
