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
        // (v) Omnichannel Consent Ledger (USSD, SMS, Web SDK, Mobile)
        Schema::create('omnichannel_consents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('data_subject_identifier', 255); // Phone, Email, BVN Hash, NIN Hash
            $table->enum('channel', ['ussd_session', 'sms_shortcode', 'web_sdk', 'mobile_app', 'physical_paper_form', 'ivr_voice_prompt'])
                ->default('web_sdk');
            $table->string('channel_session_ref', 255)->nullable();
            $table->json('raw_payload');
            $table->json('consent_categories');
            $table->string('proof_hash', 64);
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('opt_in_timestamp')->useCurrent();
            $table->boolean('is_withdrawn')->default(false);
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'data_subject_identifier'], 'omni_tenant_subj_idx');
            $table->index(['tenant_id', 'channel', 'is_withdrawn'], 'omni_tenant_channel_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('omnichannel_consents');
    }
};
