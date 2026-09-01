<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ropa_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('process_name'); // e.g. Customer Digital KYC & BVN/NIN Verification
            $table->string('department'); // e.g. Compliance, Operations, HR, IT, Marketing
            $table->text('business_purpose');
            $table->enum('legal_basis', [
                'consent',
                'contract',
                'legal_obligation',
                'vital_interest',
                'public_interest',
                'legitimate_interest'
            ]);
            $table->text('legal_basis_rationale')->nullable();
            $table->json('data_subject_categories'); // e.g. ["Customers", "Guarantors", "Next of Kin"]
            $table->json('personal_data_elements'); // e.g. ["Full Name", "BVN", "NIN", "Facial Biometrics", "Phone Number"]
            $table->boolean('special_category_data')->default(false); // Health, Biometrics, Criminal, Religious
            $table->json('recipients')->nullable(); // Internal departments / external regulators (e.g. NIBSS, CBN)
            $table->boolean('has_third_party_processor')->default(false);
            $table->json('third_party_names')->nullable(); // e.g. AWS, Paystack, Smile Identity
            $table->boolean('cross_border_transfer')->default(false);
            $table->json('transfer_destination_countries')->nullable(); // e.g. ["United Kingdom", "United States", "Germany"]
            $table->enum('transfer_safeguards', [
                'adequacy_decision',
                'ndpc_approved_bcr',
                'standard_contractual_clauses',
                'explicit_consent',
                'none'
            ])->nullable();
            $table->string('storage_location')->default('Local Server / Cloud'); // e.g. AWS eu-west-1 (Ireland)
            $table->string('retention_period')->default('6 years after account termination');
            $table->text('security_measures')->nullable(); // e.g. AES-256 encryption at rest, TLS 1.3, RBAC, MFA
            $table->boolean('requires_dpia')->default(false);
            $table->enum('status', ['draft', 'reviewed_by_dept', 'verified_by_dpo', 'approved_active'])->default('draft');
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'department', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ropa_activities');
    }
};
