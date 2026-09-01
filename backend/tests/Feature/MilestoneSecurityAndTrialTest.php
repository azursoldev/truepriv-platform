<?php

namespace Tests\Feature;

use App\Models\AuditChecklistItem;
use App\Models\AuditProject;
use App\Models\IndustryTemplate;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class MilestoneSecurityAndTrialTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test 1: User model generates secure UUIDs and is natively bound to tenant.
     */
    public function test_user_uses_secure_uuid_and_belongs_to_tenant(): void
    {
        $tenant = Tenant::create([
            'name' => 'Test Medical Corp',
            'slug' => 'test-med-corp-' . Str::random(4),
            'type' => 'corporate',
            'rc_number' => null, // Optional CAC
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Dr. Ngozi Okonjo',
            'email' => 'ngozi.' . Str::random(5) . '@testmed.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            $user->id,
            'User primary key must be a valid UUID v4'
        );

        $this->assertEquals($tenant->id, $user->tenant_id);
    }

    /**
     * Test 2: Login returns valid Bearer token with 12-hour expiration.
     */
    public function test_login_returns_token_with_12_hour_expiry(): void
    {
        $tenant = Tenant::create([
            'name' => 'Finance Hub Ltd',
            'slug' => 'fin-hub-' . Str::random(4),
            'type' => 'corporate',
        ]);

        $email = 'admin.' . Str::random(5) . '@finhub.ng';
        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'John Doe',
            'email' => $email,
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'Password@123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'token', 'user' => ['id', 'email', 'role']]);

        $tokenModel = $user->tokens()->first();
        $this->assertNotNull($tokenModel);
        $this->assertNotNull($tokenModel->expires_at);
        $this->assertTrue($tokenModel->expires_at->gt(now()->addHours(11)));
    }

    /**
     * Test 3: Idle timeout middleware blocks tokens inactive for > 30 minutes.
     */
    public function test_idle_timeout_blocks_token_after_30_minutes_inactivity(): void
    {
        $tenant = Tenant::create([
            'name' => 'Inactivity Test Corp',
            'slug' => 'inact-corp-' . Str::random(4),
            'type' => 'corporate',
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test User',
            'email' => 'idle.' . Str::random(5) . '@test.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $tokenResult = $user->createToken('test-token');
        $token = $tokenResult->plainTextToken;

        // Set last_used_at to 35 minutes ago
        $tokenModel = $user->tokens()->first();
        $tokenModel->last_used_at = now()->subMinutes(35);
        $tokenModel->save();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test 4: Vendor quota cap restricts trial accounts to 3 vendors.
     */
    public function test_starter_trial_restricts_vendor_registration_to_3(): void
    {
        $tenant = Tenant::create([
            'name' => 'Vendor Test Tenant',
            'slug' => 'vend-corp-' . Str::random(4),
            'type' => 'corporate',
        ]);

        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => 'starter_corporate',
            'status' => 'trialing',
            'current_period_start' => now(),
            'current_period_end' => now()->addDays(14),
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Vendor Admin',
            'email' => 'vendor.' . Str::random(5) . '@test.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $token = $user->createToken('vendor-token')->plainTextToken;

        // Create 3 vendors successfully
        for ($i = 1; $i <= 3; $i++) {
            $res = $this->withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'X-Tenant-ID' => $tenant->id,
            ])->postJson('/api/v1/vendors', [
                'vendor_name' => "Cloud Provider {$i}",
                'service_category' => 'Cloud Infrastructure',
                'data_types_processed' => ['email', 'ip_address'],
                'risk_rating' => 'low',
            ]);

            $res->assertStatus(201);
        }

        // 4th vendor should be rejected with 403 quota exceeded
        $fourthRes = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Tenant-ID' => $tenant->id,
        ])->postJson('/api/v1/vendors', [
            'vendor_name' => 'Extra 4th Vendor',
            'service_category' => 'Payment Gateway',
            'data_types_processed' => ['financial_data'],
            'risk_rating' => 'high',
        ]);

        $fourthRes->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => 'trial_quota_exceeded',
                'upgrade_required' => true,
            ]);
    }

    /**
     * Test 5: Trial user can VIEW report/template data in UI without restrictions.
     */
    public function test_trial_user_can_view_report_and_templates_data(): void
    {
        $tenant = Tenant::create([
            'name' => 'Trial Viewing Tenant',
            'slug' => 'viewing-corp-' . Str::random(4),
            'type' => 'corporate',
        ]);

        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => 'starter_corporate',
            'status' => 'trialing',
            'current_period_start' => now(),
            'current_period_end' => now()->addDays(14),
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Trial Officer',
            'email' => 'viewer.' . Str::random(5) . '@test.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $project = AuditProject::create([
            'tenant_id' => $tenant->id,
            'audit_year' => 2026,
            'title' => 'Statutory Audit 2026',
            'status' => 'draft',
        ]);

        AuditChecklistItem::create([
            'audit_project_id' => $project->id,
            'domain' => 'governance_accountability',
            'section_code' => 'NDPA-S24',
            'question' => 'Has the organization designated a qualified DPO?',
            'status' => 'pending_review',
        ]);

        $token = $user->createToken('view-token')->plainTextToken;

        // 1. Can view templates
        $templateRes = $this->getJson('/api/v1/templates');
        $templateRes->assertStatus(200);

        // 2. Can view audits list
        $auditsRes = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Tenant-ID' => $tenant->id,
        ])->getJson('/api/v1/audits');
        $auditsRes->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        // 3. Can view audit detail and checklist data
        $auditDetailRes = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Tenant-ID' => $tenant->id,
        ])->getJson("/api/v1/audits/{$project->id}");
        $auditDetailRes->assertStatus(200)
            ->assertJsonStructure(['success', 'project', 'grouped_checklist']);
    }

    /**
     * Test 6: Official compliance report PDF export is restricted on trial tier.
     */
    public function test_trial_tier_blocks_audit_pdf_report_export(): void
    {
        $tenant = Tenant::create([
            'name' => 'Audit Trial Tenant',
            'slug' => 'audit-corp-' . Str::random(4),
            'type' => 'corporate',
        ]);

        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => 'starter_corporate',
            'status' => 'trialing',
            'current_period_start' => now(),
            'current_period_end' => now()->addDays(14),
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Audit Officer',
            'email' => 'audit.' . Str::random(5) . '@test.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $project = AuditProject::create([
            'tenant_id' => $tenant->id,
            'audit_year' => 2026,
            'title' => 'Statutory Audit 2026',
            'status' => 'draft',
        ]);

        $token = $user->createToken('audit-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Tenant-ID' => $tenant->id,
        ])->getJson("/api/v1/audits/{$project->id}/report");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => 'trial_export_restricted',
                'upgrade_required' => true,
            ]);
    }

    /**
     * Test 7: Entitled paid active user CAN export official audit PDF report.
     */
    public function test_entitled_paid_active_user_can_export_audit_pdf_report(): void
    {
        $tenant = Tenant::create([
            'name' => 'Sterling Health Ltd',
            'slug' => 'sterling-' . Str::random(4),
            'type' => 'corporate',
            'rc_number' => 'RC-984210',
        ]);

        // Active paid growth_enterprise subscription
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => 'growth_enterprise',
            'billing_cycle' => 'annual',
            'price_ngn' => 1500000.00,
            'status' => 'active',
            'current_period_start' => now()->startOfYear(),
            'current_period_end' => now()->endOfYear(),
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Dr. Wale Johnson',
            'email' => 'wale.' . Str::random(5) . '@sterling.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $project = AuditProject::create([
            'tenant_id' => $tenant->id,
            'audit_year' => 2026,
            'title' => 'NDPC Statutory Compliance Audit 2026',
            'status' => 'draft',
        ]);

        AuditChecklistItem::create([
            'audit_project_id' => $project->id,
            'domain' => 'governance_accountability',
            'section_code' => 'NDPA-S24',
            'question' => 'Has the data controller designated a Data Protection Officer?',
            'status' => 'compliant',
            'awarded_points' => 5.0,
        ]);

        $token = $user->createToken('paid-audit-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Tenant-ID' => $tenant->id,
        ])->get("/api/v1/audits/{$project->id}/report");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }

    /**
     * Test 8: Inactive, past_due, or cancelled paid subscription cannot export report.
     */
    public function test_past_due_or_cancelled_paid_user_cannot_export_audit_report(): void
    {
        $tenant = Tenant::create([
            'name' => 'Lapsed Subscription Tenant',
            'slug' => 'lapsed-' . Str::random(4),
            'type' => 'corporate',
        ]);

        // Subscription is past_due
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => 'growth_enterprise',
            'status' => 'past_due',
            'current_period_start' => now()->subMonth(),
            'current_period_end' => now()->subDay(),
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Lapsed User',
            'email' => 'lapsed.' . Str::random(5) . '@test.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $project = AuditProject::create([
            'tenant_id' => $tenant->id,
            'audit_year' => 2026,
            'title' => 'Statutory Audit 2026',
            'status' => 'draft',
        ]);

        $token = $user->createToken('lapsed-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Tenant-ID' => $tenant->id,
        ])->getJson("/api/v1/audits/{$project->id}/report");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => 'trial_export_restricted',
                'upgrade_required' => true,
            ]);
    }

    /**
     * Test 9: Multi-tenant security prevents cross-tenant audit report access/export.
     */
    public function test_cross_tenant_report_export_is_rejected(): void
    {
        // Tenant A (Paid)
        $tenantA = Tenant::create([
            'name' => 'Company A',
            'slug' => 'company-a-' . Str::random(4),
            'type' => 'corporate',
        ]);

        Subscription::create([
            'tenant_id' => $tenantA->id,
            'plan_tier' => 'growth_enterprise',
            'status' => 'active',
        ]);

        $userA = User::create([
            'tenant_id' => $tenantA->id,
            'name' => 'User A',
            'email' => 'usera.' . Str::random(5) . '@companya.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        // Tenant B (Victim company with confidential audit)
        $tenantB = Tenant::create([
            'name' => 'Company B',
            'slug' => 'company-b-' . Str::random(4),
            'type' => 'corporate',
        ]);

        Subscription::create([
            'tenant_id' => $tenantB->id,
            'plan_tier' => 'growth_enterprise',
            'status' => 'active',
        ]);

        $projectB = AuditProject::create([
            'tenant_id' => $tenantB->id,
            'audit_year' => 2026,
            'title' => 'Company B Confidential Audit',
            'status' => 'draft',
        ]);

        $tokenA = $userA->createToken('token-a')->plainTextToken;

        // User A tries to download Project B using User A's valid token in Tenant A context
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $tokenA,
            'X-Tenant-ID' => $tenantA->id,
        ])->getJson("/api/v1/audits/{$projectB->id}/report");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthorized. This audit project belongs to another organization.',
            ]);
    }

    /**
     * Test 10: Unauthorized X-Tenant-ID spoofing is rejected by middleware.
     */
    public function test_header_manipulation_cannot_bypass_tenant_isolation(): void
    {
        $tenantA = Tenant::create([
            'name' => 'Attacker Corp',
            'slug' => 'attacker-' . Str::random(4),
            'type' => 'corporate',
        ]);

        $userA = User::create([
            'tenant_id' => $tenantA->id,
            'name' => 'Attacker User',
            'email' => 'attacker.' . Str::random(5) . '@attacker.ng',
            'password' => Hash::make('Password@123'),
            'role' => 'corporate_admin',
        ]);

        $tenantB = Tenant::create([
            'name' => 'Target Corp',
            'slug' => 'target-' . Str::random(4),
            'type' => 'corporate',
        ]);

        $projectB = AuditProject::create([
            'tenant_id' => $tenantB->id,
            'audit_year' => 2026,
            'title' => 'Target Corp Audit',
            'status' => 'draft',
        ]);

        $tokenA = $userA->createToken('attacker-token')->plainTextToken;

        // Attacker attempts to spoof X-Tenant-ID header to Target Corp's ID
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $tokenA,
            'X-Tenant-ID' => $tenantB->id, // Spoofed header
        ])->getJson("/api/v1/audits/{$projectB->id}/report");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthorized tenant access. You do not have an active engagement with this organization.',
            ]);
    }
}
