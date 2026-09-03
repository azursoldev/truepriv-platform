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
        // (iv) AI Decision Logs Table Shell
        Schema::create('ai_decision_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('decision_type', 100); // e.g. 'ropa_legal_basis_recommendation', 'dpia_risk_scoring', 'breach_severity_triage'
            $table->string('model_name', 100)->default('claude-3-5-sonnet');
            $table->integer('prompt_tokens')->default(0);
            $table->integer('completion_tokens')->default(0);
            $table->decimal('confidence_score', 4, 2)->default(0.95);
            $table->json('input_payload');
            $table->json('ai_output_payload');
            $table->enum('human_override_status', ['pending', 'accepted', 'modified', 'rejected'])->default('accepted');
            $table->text('human_override_rationale')->nullable();
            $table->string('ledger_hash', 128)->nullable(); // SHA-256 cryptographic chain hash for tamper-proof regulatory audit trails
            $table->timestamps();

            $table->index(['tenant_id', 'decision_type'], 'ai_logs_tenant_decision_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_decision_logs');
    }
};
