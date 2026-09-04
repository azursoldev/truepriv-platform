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
        Schema::table('tenants', function (Blueprint $table) {
            // (i) Parent-Child sub-workspace hierarchy
            $table->foreignUuid('parent_tenant_id')->nullable()->after('type')->constrained('tenants')->nullOnDelete();
            $table->enum('tenant_tier', ['independent_corporate', 'parent_holding_group', 'dpo_agency_hub', 'dpco_audit_practice', 'sub_workspace_client'])
                ->default('independent_corporate')
                ->after('parent_tenant_id');

            // (ii) SaaS Capacity Metering & Feature Flag JSONB columns
            $table->json('feature_flags')->nullable()->after('compliance_score');
            $table->integer('data_subject_quota')->default(50000)->after('feature_flags');
            $table->integer('monthly_dsar_limit')->default(999999)->after('data_subject_quota'); // Set to ultra-high default (unlimited) per enterprise SaaS monetization model
            $table->integer('monthly_breach_limit')->default(999999)->after('monthly_dsar_limit'); // Set to ultra-high default (unlimited) per enterprise SaaS monetization model
            $table->json('usage_metrics')->nullable()->after('monthly_breach_limit');

            $table->index(['parent_tenant_id', 'tenant_tier'], 'tenants_parent_tier_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['parent_tenant_id']);
            $table->dropIndex('tenants_parent_tier_idx');
            $table->dropColumn([
                'parent_tenant_id',
                'tenant_tier',
                'feature_flags',
                'data_subject_quota',
                'monthly_dsar_limit',
                'monthly_breach_limit',
                'usage_metrics',
            ]);
        });
    }
};
