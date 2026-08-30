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
        // 1. Subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->enum('plan_tier', ['starter_corporate', 'growth_enterprise', 'dpo_unlimited', 'dpco_audit_suite'])->default('starter_corporate');
            $table->enum('billing_cycle', ['monthly', 'annual'])->default('annual');
            $table->decimal('price_ngn', 12, 2)->default(0.00);
            $table->enum('status', ['active', 'past_due', 'cancelled', 'trialing'])->default('trialing');
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });

        // 2. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('transaction_reference', 100)->unique();
            $table->enum('payment_gateway', ['paystack', 'flutterwave', 'bank_transfer'])->default('paystack');
            $table->decimal('amount_paid', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->string('gateway_status', 50)->default('successful');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'paid_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
    }
};
