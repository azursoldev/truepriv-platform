<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Services\DataResidencyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Tests\TestCase;

class DataResidencyRoutingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test 1: Feature flag defaults to false for early launch phase.
     */
    public function test_feature_flag_defaults_to_false_in_config(): void
    {
        $service = app(DataResidencyService::class);
        $this->assertFalse(
            $service->isDualResidencyEnabled(),
            'DUAL_RESIDENCY_ENABLED feature flag must default to false for initial single-region launch'
        );
    }

    /**
     * Test 2: Public /features endpoint returns correct metadata and active launch strategy.
     */
    public function test_public_features_endpoint_returns_residency_metadata(): void
    {
        $response = $this->getJson('/api/v1/features');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'features' => [
                    'dual_residency_enabled',
                    'default_residency',
                    'available_regions',
                    'active_strategy',
                ],
            ])
            ->assertJson([
                'success' => true,
                'features' => [
                    'dual_residency_enabled' => false,
                    'default_residency' => 'local_nigeria',
                ],
            ]);
    }

    /**
     * Test 3: Registration automatically routes 100% of new tenants to local_nigeria when flag is false.
     */
    public function test_registration_defaults_to_local_nigeria_residency(): void
    {
        Config::set('residency.enabled', false);

        $response = $this->postJson('/api/v1/auth/register', [
            'organization_name' => 'First National Health Services',
            'tenant_type' => 'corporate',
            'name' => 'Chief Medical Director',
            'email' => 'cmd.' . Str::random(5) . '@fnhs.ng',
            'password' => 'Password@123',
            'state' => 'Abuja FCT',
        ]);

        $response->assertStatus(201);

        $tenant = Tenant::where('name', 'First National Health Services')->first();
        $this->assertNotNull($tenant);
        $this->assertEquals('local_nigeria', $tenant->data_residency);
        $this->assertEquals('local_nigeria', $tenant->getDatabaseConnection());
    }

    /**
     * Test 4: Inactive feature flag safely prevents selection of global_aws (forces local_nigeria).
     */
    public function test_inactive_feature_flag_forces_local_nigeria_even_if_global_aws_requested(): void
    {
        Config::set('residency.enabled', false);

        $response = $this->postJson('/api/v1/auth/register', [
            'organization_name' => 'Offshore Attempt Corp',
            'tenant_type' => 'corporate',
            'name' => 'Global IT Admin',
            'email' => 'admin.' . Str::random(5) . '@offshore.ng',
            'password' => 'Password@123',
            'data_residency' => 'global_aws', // Attempt to pick AWS while flag is false
        ]);

        $response->assertStatus(201);

        $tenant = Tenant::where('name', 'Offshore Attempt Corp')->first();
        $this->assertNotNull($tenant);
        // Must be safely downgraded/forced to local_nigeria
        $this->assertEquals('local_nigeria', $tenant->data_residency);
        $this->assertEquals('local_nigeria', $tenant->getDatabaseConnection());
    }

    /**
     * Test 5: Dynamic activation - when flag is true, registration dynamically supports global_aws.
     */
    public function test_active_feature_flag_allows_global_aws_residency(): void
    {
        Config::set('residency.enabled', true);

        $response = $this->postJson('/api/v1/auth/register', [
            'organization_name' => 'Multinational Fintech Corp',
            'tenant_type' => 'corporate',
            'name' => 'VP Technology',
            'email' => 'tech.' . Str::random(5) . '@fintech.global',
            'password' => 'Password@123',
            'data_residency' => 'global_aws',
        ]);

        $response->assertStatus(201);

        $tenant = Tenant::where('name', 'Multinational Fintech Corp')->first();
        $this->assertNotNull($tenant);
        $this->assertEquals('global_aws', $tenant->data_residency);
        $this->assertEquals('global_aws', $tenant->getDatabaseConnection());
    }

    /**
     * Test 6: Database connection router dynamically resolves appropriate connection name.
     */
    public function test_tenant_database_connection_router_resolution(): void
    {
        $service = app(DataResidencyService::class);

        // Tenant 1: Local Nigeria
        $localTenant = Tenant::create([
            'name' => 'Local Microfinance Bank',
            'slug' => 'local-mfb-' . Str::random(4),
            'type' => 'corporate',
            'data_residency' => 'local_nigeria',
        ]);

        // Tenant 2: Global AWS
        $awsTenant = Tenant::create([
            'name' => 'Global Remittance Corp',
            'slug' => 'global-remit-' . Str::random(4),
            'type' => 'corporate',
            'data_residency' => 'global_aws',
        ]);

        // When flag is false, both route safely to local_nigeria
        Config::set('residency.enabled', false);
        $this->assertEquals('local_nigeria', $service->getConnectionForTenant($localTenant));
        $this->assertEquals('local_nigeria', $service->getConnectionForTenant($awsTenant));

        // When flag is true, dynamic routing separates local and AWS
        Config::set('residency.enabled', true);
        $this->assertEquals('local_nigeria', $service->getConnectionForTenant($localTenant));
        $this->assertEquals('global_aws', $service->getConnectionForTenant($awsTenant));
    }
}
