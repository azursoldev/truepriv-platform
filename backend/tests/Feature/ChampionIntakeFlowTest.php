<?php

namespace Tests\Feature;

use App\Models\GuestInvitation;
use App\Models\RopaActivity;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ChampionIntakeFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test full decentralized champion lifecycle: invitation -> public resolve -> public submission -> ROPA.
     */
    public function test_champion_invitation_and_public_intake_submission(): void
    {
        // 1. Create tenant and compliance officer user
        $tenant = Tenant::create([
            'name' => 'Fidelity Health HMO',
            'slug' => 'fidelity-health-' . Str::random(5),
            'type' => 'corporate',
            'data_residency' => 'local_nigeria',
        ]);

        $officer = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Aisha Bello',
            'email' => 'aisha.' . Str::random(6) . '@fidelityhealth.ng',
            'password' => bcrypt('SecurePassword@123'),
            'role' => 'compliance_officer',
        ]);

        $token = $officer->createToken('auth')->plainTextToken;

        // 2. Compliance Officer invites HR Champion
        $inviteRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/invitations', [
                'email' => 'hr.lead@fidelityhealth.ng',
                'department_assigned' => 'Human Resources',
                'notes' => 'Document health insurance enrollment data flow',
                'expires_days' => 7,
            ]);

        $inviteRes->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $invitationToken = $inviteRes->json('data.invitation_token');
        $this->assertNotEmpty($invitationToken);

        // 3. Public Champion Resolves Token (No Auth Bearer Token required)
        $resolveRes = $this->getJson("/api/v1/public/invitations/{$invitationToken}");
        $resolveRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'tenant_name' => 'Fidelity Health HMO',
                    'department' => 'Human Resources',
                    'email' => 'hr.lead@fidelityhealth.ng',
                    'status' => 'pending',
                ],
            ]);

        // 4. Public Champion Submits Department Processing Data (No Auth required)
        $submitRes = $this->postJson("/api/v1/public/invitations/{$invitationToken}/submit", [
            'process_name' => 'Staff Medical Enrollment & HMO Claims',
            'business_purpose' => 'Employee health benefit provision and statutory claims administration',
            'legal_basis' => 'contract',
            'personal_data_elements' => ['Full Name', 'Medical History', 'Blood Group', 'Next of Kin'],
            'storage_location' => 'Cloud HMO Portal & Encrypted HR DB',
            'retention_period' => '5 Years post-employment',
            'notes' => 'Access strictly restricted to Chief Medical Director & HR Manager',
        ]);

        $submitRes->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // 5. Verify ROPA record was created for the tenant
        $ropa = RopaActivity::where('tenant_id', $tenant->id)
            ->where('process_name', 'Staff Medical Enrollment & HMO Claims')
            ->first();

        $this->assertNotNull($ropa);
        $this->assertEquals('Human Resources', $ropa->department);
        $this->assertEquals('draft', $ropa->status);

        // 6. Verify invitation is now marked accepted
        $invitation = GuestInvitation::where('invitation_token', $invitationToken)->first();
        $this->assertEquals('accepted', $invitation->status);
        $this->assertNotNull($invitation->accepted_at);
    }
}
