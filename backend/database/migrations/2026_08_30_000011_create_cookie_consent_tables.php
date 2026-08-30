<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Cookie Banners configuration per tenant
        Schema::create('cookie_banners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('domain'); // e.g. https://myfintech.ng
            $table->string('theme_color')->default('#059669');
            $table->enum('position', [
                'bottom_bar',
                'floating_bottom_left',
                'floating_bottom_right',
                'center_modal'
            ])->default('bottom_bar');
            $table->string('privacy_policy_url')->nullable();
            $table->string('company_display_name')->nullable();
            $table->text('custom_notice_text')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // 2. Cookie Proof-of-Consent Log
        Schema::create('cookie_consents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('visitor_uuid');
            $table->json('accepted_categories'); // e.g. {"necessary": true, "functional": true, "analytics": false, "marketing": false}
            $table->string('ip_hash')->nullable(); // SHA-256 hashed IP for NDPA privacy
            $table->text('user_agent')->nullable();
            $table->timestamp('consented_at')->useCurrent();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'consented_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cookie_consents');
        Schema::dropIfExists('cookie_banners');
    }
};
