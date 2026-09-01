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
        // 1. DSAR Actions Timeline
        Schema::create('dsar_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dsar_request_id')->constrained('dsar_requests')->cascadeOnDelete();
            $table->foreignUuid('performed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('action_type', ['id_verified', 'records_retrieved', 'redaction_applied', 'response_dispatched', 'rejected', 'sla_extended', 'note_logged'])->default('note_logged');
            $table->text('action_notes');
            $table->timestamps();

            $table->index(['dsar_request_id', 'created_at']);
        });

        // 2. Audit Comments
        Schema::create('audit_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('audit_project_id')->constrained('audit_projects')->cascadeOnDelete();
            $table->foreignUuid('finding_id')->nullable()->constrained('audit_findings')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('comment_text');
            $table->timestamps();

            $table->index(['audit_project_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_comments');
        Schema::dropIfExists('dsar_actions');
    }
};
