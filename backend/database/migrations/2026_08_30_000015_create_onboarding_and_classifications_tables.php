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
        // 1. Onboarding Questions
        Schema::create('onboarding_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('category', 100);
            $table->text('question_text');
            $table->text('explanation_guide')->nullable();
            $table->integer('weight_points')->default(5);
            $table->boolean('is_mandatory')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // 2. Onboarding Answers
        Schema::create('onboarding_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('onboarding_questions')->cascadeOnDelete();
            $table->foreignId('answered_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('response_boolean')->nullable();
            $table->text('response_text')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'question_id']);
        });

        // 3. Data Controller Classifications (MDC Category - NDPA Sec 48)
        Schema::create('data_controller_classifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->enum('calculated_tier', ['standard_controller', 'mdc_high', 'mdc_extra_high', 'mdc_ultra_high'])->default('standard_controller');
            $table->json('criteria_evaluated')->nullable();
            $table->decimal('annual_filing_fee_applicable', 10, 2)->default(0.00);
            $table->boolean('mandatory_dpo_required')->default(true);
            $table->boolean('statutory_audit_mandatory')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'calculated_tier'], 'dcc_tenant_tier_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_controller_classifications');
        Schema::dropIfExists('onboarding_answers');
        Schema::dropIfExists('onboarding_questions');
    }
};
