<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SubscriptionAndBillingTest extends TestCase
{
    use RefreshDatabase;

    private function createAuthenticatedUser(string $tenantType = 'corporate', string $planTier = 'starter_corporate', string $status = 'trialing'): array
    {
        $tenant = Tenant::create([
            'name' => 'Apex Microfinance Bank',
            'slug' => 'apex-mfb-' . Str::random(5),
            'type' => $tenantType,
            'data_residency' => 'local_nigeria',
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Chukwuemeka Okonkwo',
            'email' => 'compliance.' . Str::random(6) . '@apexmfb.ng',
            'password' => bcrypt('SecurePassword@123'),
            'role' => 'compliance_officer',
        ]);

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_tier' => $planTier,
            'billing_cycle' => 'annual',
            'price_ngn' => $planTier === 'growth_enterprise' ? 450000.00 : 0.00,
            'status' => $status,
            'current_period_start' => now(),
            'current_period_end' => now()->addDays(14),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [$tenant, $user, $token, $subscription];
    }

    /**
     * Test 1: Fetching subscription details returns active plan and Nigerian Naira pricing.
     */
    public function test_can_fetch_subscription_details_and_pricing_tiers(): void
    {
        [$tenant, $user, $token] = $this->createAuthenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/subscription');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'subscription',
                    'days_remaining',
                    'is_active_paid',
                    'can_export_reports',
                    'available_plans',
                    'payments_history',
                    'paystack_public_key',
                ],
            ]);

        // Verify initial state is trialing with report export locked
        $this->assertFalse($response->json('data.can_export_reports'));
        $this->assertArrayHasKey('growth_enterprise', $response->json('data.available_plans'));
        $this->assertEquals(450000.00, $response->json('data.available_plans.growth_enterprise.annual_ngn'));
    }

    /**
     * Test 2: Initializing Paystack transaction generates reference and kobo amount.
     */
    public function test_can_initialize_paystack_transaction(): void
    {
        [$tenant, $user, $token] = $this->createAuthenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/subscription/initialize-paystack', [
                'plan_tier' => 'growth_enterprise',
                'billing_cycle' => 'annual',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount_kobo' => 45000000,
                    'amount_ngn' => 450000.00,
                    'plan_tier' => 'growth_enterprise',
                    'billing_cycle' => 'annual',
                ],
            ]);

        $this->assertStringStartsWith('TP-PAY-', $response->json('data.reference'));
    }

    /**
     * Test 3: Plan upgrade activates subscription, logs payment, and unlocks compliance reports.
     */
    public function test_upgrading_plan_activates_subscription_and_unlocks_reports(): void
    {
        [$tenant, $user, $token] = $this->createAuthenticatedUser();

        // Ensure reports are initially locked
        $this->assertFalse($tenant->canExportComplianceReports());

        $txnRef = 'TP-TEST-TXN-' . Str::random(8);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/subscription/upgrade', [
                'plan_tier' => 'growth_enterprise',
                'billing_cycle' => 'annual',
                'payment_gateway' => 'paystack',
                'transaction_reference' => $txnRef,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'subscription' => [
                        'plan_tier' => 'growth_enterprise',
                        'status' => 'active',
                    ],
                    'payment' => [
                        'transaction_reference' => $txnRef,
                        'amount_paid' => '450000.00',
                        'currency' => 'NGN',
                        'payment_gateway' => 'paystack',
                    ],
                    'can_export_reports' => true,
                ],
            ]);

        // Verify database and model reflection
        $freshTenant = $tenant->fresh();
        $this->assertTrue($freshTenant->canExportComplianceReports());
        $this->assertDatabaseHas('payments', [
            'transaction_reference' => $txnRef,
            'tenant_id' => $tenant->id,
            'amount_paid' => 450000.00,
        ]);
    }
}
