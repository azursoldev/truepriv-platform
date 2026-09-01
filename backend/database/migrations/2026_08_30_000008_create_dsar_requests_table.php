<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dsar_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('ticket_number')->unique(); // e.g. DSAR-2026-8942
            $table->enum('request_type', [
                'access_copy',
                'rectification',
                'erasure',
                'objection',
                'restrict_processing',
                'data_portability'
            ]);
            $table->string('data_subject_name');
            $table->string('data_subject_email');
            $table->string('data_subject_phone')->nullable();
            $table->enum('subject_relationship', [
                'customer',
                'former_customer',
                'employee',
                'job_applicant',
                'vendor_contact',
                'other'
            ])->default('customer');
            $table->text('request_details');
            $table->string('id_document_path')->nullable();
            $table->boolean('id_verified')->default(false);
            $table->timestamp('sla_deadline'); // 30 calendar days from receipt (NDPA Sec 34)
            $table->enum('status', [
                'submitted',
                'identity_verified',
                'investigating',
                'action_taken',
                'completed',
                'rejected'
            ])->default('submitted');
            $table->text('response_summary')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignUuid('assigned_dpo_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'status', 'sla_deadline']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dsar_requests');
    }
};
