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
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'proof_document_path')) {
                $table->text('proof_document_path')->nullable()->after('gateway_status');
            }
            if (!Schema::hasColumn('payments', 'depositor_name')) {
                $table->string('depositor_name')->nullable()->after('proof_document_path');
            }
            if (!Schema::hasColumn('payments', 'bank_name')) {
                $table->string('bank_name')->nullable()->after('depositor_name');
            }
            if (!Schema::hasColumn('payments', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('bank_name');
            }
            if (!Schema::hasColumn('payments', 'reviewed_by')) {
                $table->uuid('reviewed_by')->nullable()->after('admin_notes');
            }
            if (!Schema::hasColumn('payments', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'proof_document_path',
                'depositor_name',
                'bank_name',
                'admin_notes',
                'reviewed_by',
                'reviewed_at',
            ]);
        });
    }
};
