<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable()->after('id');
            $table->enum('role', [
                'super_admin',
                'dpco_lead_auditor',
                'dpco_staff',
                'outsourced_dpo',
                'corporate_admin',
                'compliance_officer',
                'dept_champion',
                'auditor_viewer'
            ])->default('corporate_admin')->after('email');
            $table->string('department')->nullable()->after('role'); // e.g. IT, Legal, HR, Finance, Operations
            $table->string('phone')->nullable()->after('department');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('avatar_url');

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn(['tenant_id', 'role', 'department', 'phone', 'avatar_url', 'is_active']);
        });
    }
};
