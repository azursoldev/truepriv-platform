<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dpia_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('ropa_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->json('high_risk_reasons')->nullable(); // e.g. ["Biometric Data Processing", "Automated Profiling / Credit Scoring"]
            $table->text('nature_of_processing')->nullable();
            $table->text('necessity_proportionality_check')->nullable();
            $table->tinyInteger('inherent_likelihood')->default(3); // 1-5
            $table->tinyInteger('inherent_impact')->default(3); // 1-5
            $table->tinyInteger('inherent_risk_score')->default(9); // 1-25
            $table->enum('inherent_risk_level', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->json('mitigation_measures')->nullable(); // List of safeguards
            $table->tinyInteger('residual_likelihood')->default(1); // 1-5
            $table->tinyInteger('residual_impact')->default(2); // 1-5
            $table->tinyInteger('residual_risk_score')->default(2); // 1-25
            $table->enum('residual_risk_level', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->text('dpo_recommendations')->nullable();
            $table->enum('dpo_sign_off_status', ['pending', 'approved', 'requires_consultation_ndpc', 'rejected'])->default('pending');
            $table->text('dpco_review_notes')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('ropa_id')->references('id')->on('ropa_activities')->onDelete('set null');
            $table->index(['tenant_id', 'dpo_sign_off_status', 'residual_risk_level'], 'dpia_tenant_status_risk_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dpia_assessments');
    }
};
