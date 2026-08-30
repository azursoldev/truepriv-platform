<?php

namespace Database\Seeders;

use App\Models\AuditChecklistItem;
use App\Models\AuditEvidence;
use App\Models\AuditFinding;
use App\Models\AuditProject;
use App\Models\CompanyProfile;
use App\Models\CookieBanner;
use App\Models\CookieConsent;
use App\Models\DataBreach;
use App\Models\DataControllerClassification;
use App\Models\DpcoProfile;
use App\Models\DpiaAssessment;
use App\Models\DpoProfile;
use App\Models\DsarRequest;
use App\Models\OnboardingQuestion;
use App\Models\Policy;
use App\Models\RopaActivity;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\TenantClientOrganization;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin User
        User::updateOrCreate(
            ['email' => 'admin@dpodpco.ng'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('Password123!'),
                'role' => 'super_admin',
                'department' => 'Executive',
                'phone' => '+2348011223344',
                'is_active' => true,
            ]
        );

        // 2. Corporate Tenant (Apex Microfinance Bank Ltd)
        $apexTenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Apex Microfinance Bank Nigeria Ltd',
            'slug' => 'apex-mfb',
            'type' => 'corporate',
            'industry' => 'Fintech & Payment Service Providers',
            'rc_number' => 'RC-1489201',
            'ndpc_registration_number' => 'NDPC/DCMI/2026/0891',
            'contact_email' => 'compliance@apexmfb.ng',
            'contact_phone' => '+2348023456789',
            'address' => 'Plot 12, Adeola Odeku Street, Victoria Island',
            'state' => 'Lagos',
            'compliance_score' => 78.50,
            'settings' => [
                'primary_color' => '#059669',
                'logo_url' => '/logos/apex-logo.svg',
                'notify_on_breach' => true,
                'notify_on_dsar' => true,
            ],
            'is_active' => true,
        ]);

        CompanyProfile::create([
            'tenant_id' => $apexTenant->id,
            'cac_rc_number' => 'RC-1489201',
            'tax_identification_number' => 'TIN-29104918-0001',
            'sector' => 'Banking & Financial Technology',
            'data_protection_officer_name' => 'Amina Bello',
            'data_protection_officer_email' => 'dpo@apexmfb.ng',
            'mdc_classification_tier' => 'mdc_high',
            'employee_count_bracket' => '100-250 employees',
            'annual_data_subjects_processed' => 150000,
            'registered_office_address' => 'Plot 12, Adeola Odeku Street, Victoria Island, Lagos State',
        ]);

        DataControllerClassification::create([
            'tenant_id' => $apexTenant->id,
            'calculated_tier' => 'mdc_high',
            'criteria_evaluated' => [
                'financial_data' => true,
                'biometric_kyc' => true,
                'records_volume' => 150000,
            ],
            'annual_filing_fee_applicable' => 250000.00,
            'mandatory_dpo_required' => true,
            'statutory_audit_mandatory' => true,
        ]);

        Subscription::create([
            'tenant_id' => $apexTenant->id,
            'plan_tier' => 'growth_enterprise',
            'billing_cycle' => 'annual',
            'price_ngn' => 1500000.00,
            'status' => 'active',
            'current_period_start' => now()->startOfYear(),
            'current_period_end' => now()->endOfYear(),
        ]);

        $apexAdmin = User::create([
            'tenant_id' => $apexTenant->id,
            'name' => 'Tunde Bakare',
            'email' => 'compliance@apexmfb.ng',
            'password' => Hash::make('Password123!'),
            'role' => 'corporate_admin',
            'department' => 'Compliance & Legal',
            'phone' => '+2348023456789',
            'is_active' => true,
        ]);

        $apexDpo = User::create([
            'tenant_id' => $apexTenant->id,
            'name' => 'Amina Bello (Internal DPO)',
            'email' => 'dpo@apexmfb.ng',
            'password' => Hash::make('Password123!'),
            'role' => 'compliance_officer',
            'department' => 'Risk & Compliance',
            'phone' => '+2348034567890',
            'is_active' => true,
        ]);

        // 3. Outsourced DPO Firm Tenant (Fortress Advisory)
        $fortressTenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Fortress Data Protection Advisory LLP',
            'slug' => 'fortress-dpo',
            'type' => 'outsourced_dpo',
            'industry' => 'Legal & Compliance Consulting',
            'rc_number' => 'RC-2049182',
            'contact_email' => 'contact@fortressadvisory.ng',
            'contact_phone' => '+2348055667788',
            'address' => '8th Floor, Churchgate Tower, Central Business District',
            'state' => 'Abuja FCT',
            'is_active' => true,
        ]);

        DpoProfile::create([
            'tenant_id' => $fortressTenant->id,
            'lead_consultant_name' => 'Barrister Chukwuma Obi',
            'lead_consultant_email' => 'lead.dpo@fortressadvisory.ng',
            'professional_certifications' => ['CDPO (Certified Data Protection Officer)', 'CIPM', 'LLM Cyberlaw'],
            'consulting_tier' => 'executive_partner',
            'active_client_capacity' => 15,
        ]);

        $fortressDpoUser = User::create([
            'tenant_id' => $fortressTenant->id,
            'name' => 'Barrister Chukwuma Obi (Lead DPO)',
            'email' => 'lead.dpo@fortressadvisory.ng',
            'password' => Hash::make('Password123!'),
            'role' => 'outsourced_dpo',
            'department' => 'DPO Advisory Practice',
            'phone' => '+2348055667788',
            'is_active' => true,
        ]);

        // 4. Licensed DPCO Firm Tenant (Vanguard Compliance Partners DPCO)
        $vanguardTenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Vanguard Compliance & Audit Partners DPCO',
            'slug' => 'vanguard-dpco',
            'type' => 'dpco_firm',
            'industry' => 'Audit, Assurance & DPCO Certification',
            'rc_number' => 'RC-993812',
            'dpco_license_number' => 'NDPC/DPCO/2026/042',
            'contact_email' => 'audit@vanguarddpco.ng',
            'contact_phone' => '+2348077889900',
            'address' => '24A Glover Road, Ikoyi',
            'state' => 'Lagos',
            'is_active' => true,
        ]);

        DpcoProfile::create([
            'tenant_id' => $vanguardTenant->id,
            'ndpc_license_number' => 'NDPC/DPCO/2026/042',
            'managing_partner_name' => 'Dr. Folake Adeleke',
            'managing_partner_email' => 'lead.partner@vanguarddpco.ng',
            'accreditation_year' => 2026,
            'digital_seal_signature_hash' => 'SHA256:88391AC9901482E198305F9A88710B6C',
            'license_status' => 'active',
        ]);

        $vanguardLeadAuditor = User::create([
            'tenant_id' => $vanguardTenant->id,
            'name' => 'Dr. Folake Adeleke (Managing DPCO Partner)',
            'email' => 'lead.partner@vanguarddpco.ng',
            'password' => Hash::make('Password123!'),
            'role' => 'dpco_lead_auditor',
            'department' => 'Statutory Audit Practice',
            'phone' => '+2348077889900',
            'is_active' => true,
        ]);

        $vanguardStaffAuditor = User::create([
            'tenant_id' => $vanguardTenant->id,
            'name' => 'Emeka Nwosu (Senior Auditor)',
            'email' => 'auditor1@vanguarddpco.ng',
            'password' => Hash::make('Password123!'),
            'role' => 'dpco_staff',
            'department' => 'Assurance & Fieldwork',
            'phone' => '+2348088990011',
            'is_active' => true,
        ]);

        // 5. Additional Demo Corporate Clients managed by DPCO and DPO
        $client2 = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'HealthPoint Telemedicine Nigeria Ltd',
            'slug' => 'healthpoint-ng',
            'type' => 'corporate',
            'industry' => 'Healthcare, Hospitals & Telemedicine',
            'rc_number' => 'RC-1678234',
            'compliance_score' => 64.00,
            'state' => 'Lagos',
            'is_active' => true,
        ]);

        $client3 = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'SwiftExpress Logistics Global Services',
            'slug' => 'swiftexpress-ng',
            'type' => 'corporate',
            'industry' => 'E-Commerce & Digital Marketplaces',
            'rc_number' => 'RC-1554902',
            'compliance_score' => 88.00,
            'state' => 'Rivers',
            'is_active' => true,
        ]);

        // Link DPCO & DPO Engagements
        TenantClientOrganization::create([
            'parent_tenant_id' => $vanguardTenant->id,
            'client_tenant_id' => $apexTenant->id,
            'contract_ref' => 'DPCO-2026-APX-01',
            'service_scope' => 'annual_audit_filing',
            'assigned_lead_auditor_id' => $vanguardLeadAuditor->id,
            'status' => 'active',
            'engagement_start_date' => '2026-01-10',
            'engagement_end_date' => '2026-12-31',
        ]);

        TenantClientOrganization::create([
            'parent_tenant_id' => $vanguardTenant->id,
            'client_tenant_id' => $client2->id,
            'contract_ref' => 'DPCO-2026-HLT-02',
            'service_scope' => 'annual_audit_filing',
            'assigned_lead_auditor_id' => $vanguardLeadAuditor->id,
            'status' => 'active',
            'engagement_start_date' => '2026-02-01',
            'engagement_end_date' => '2026-12-31',
        ]);

        TenantClientOrganization::create([
            'parent_tenant_id' => $fortressTenant->id,
            'client_tenant_id' => $apexTenant->id,
            'contract_ref' => 'DPOaaS-2026-APX',
            'service_scope' => 'full_dpo_as_a_service',
            'assigned_lead_auditor_id' => $fortressDpoUser->id,
            'status' => 'active',
            'engagement_start_date' => '2026-01-01',
            'engagement_end_date' => '2026-12-31',
        ]);

        TenantClientOrganization::create([
            'parent_tenant_id' => $fortressTenant->id,
            'client_tenant_id' => $client3->id,
            'contract_ref' => 'DPOaaS-2026-SWF',
            'service_scope' => 'full_dpo_as_a_service',
            'assigned_lead_auditor_id' => $fortressDpoUser->id,
            'status' => 'active',
            'engagement_start_date' => '2026-01-15',
            'engagement_end_date' => '2026-12-31',
        ]);

        // 6. Pre-populate Apex Microfinance Bank RoPA activities
        $ropa1 = RopaActivity::create([
            'tenant_id' => $apexTenant->id,
            'process_name' => 'Mobile App Digital Onboarding & KYC (BVN/NIN Verification)',
            'department' => 'Compliance & Risk',
            'business_purpose' => 'Customer identification and verification in compliance with CBN AML/CFT 2022 and NDPA 2023 regulations.',
            'legal_basis' => 'legal_obligation',
            'legal_basis_rationale' => 'NDPA Section 25(1)(b) & CBN AML/CFT Regulations',
            'data_subject_categories' => ['Retail Bank Customers', 'Account Signatories'],
            'personal_data_elements' => ['Full Name', 'BVN', 'NIN', 'Facial Biometric Selfie', 'Residential Address', 'Date of Birth'],
            'special_category_data' => true,
            'recipients' => ['NIBSS', 'NIMC', 'Fraud Analytics Unit'],
            'has_third_party_processor' => true,
            'third_party_names' => ['Smile Identity', 'AWS Ireland'],
            'cross_border_transfer' => true,
            'transfer_destination_countries' => ['Ireland'],
            'transfer_safeguards' => 'standard_contractual_clauses',
            'storage_location' => 'AWS eu-west-1 (Ireland) Encrypted DB',
            'retention_period' => '6 years after account closure',
            'security_measures' => 'AES-256 field level encryption, TLS 1.3, strict IAM roles, periodic key rotation',
            'requires_dpia' => true,
            'status' => 'approved_active',
            'reviewed_by' => $apexDpo->id,
            'approved_at' => now()->subDays(12),
        ]);

        $ropa2 = RopaActivity::create([
            'tenant_id' => $apexTenant->id,
            'process_name' => 'Debit Card Issuance & NIBSS Instant Settlement',
            'department' => 'Treasury & Payments',
            'business_purpose' => 'Processing POS transactions, ATM withdrawals, and web payments across Nigeria.',
            'legal_basis' => 'contract',
            'legal_basis_rationale' => 'NDPA Section 25(1)(a) Performance of cardholder agreement',
            'data_subject_categories' => ['Cardholders'],
            'personal_data_elements' => ['Masked PAN', 'Cardholder Name', 'Expiry Date', 'Transaction Amounts', 'Terminal ID'],
            'special_category_data' => false,
            'recipients' => ['Interswitch', 'Mastercard Scheme', 'NIBSS'],
            'has_third_party_processor' => true,
            'third_party_names' => ['Interswitch Nigeria', 'Paystack'],
            'cross_border_transfer' => false,
            'storage_location' => 'Tier III Lagos Data Center',
            'retention_period' => '7 years for CBN financial ledger standards',
            'security_measures' => 'PCI-DSS Level 1 compliance, HSM encryption, 3D Secure 2.0 OTP',
            'requires_dpia' => false,
            'status' => 'approved_active',
            'reviewed_by' => $apexDpo->id,
            'approved_at' => now()->subDays(10),
        ]);

        $ropa3 = RopaActivity::create([
            'tenant_id' => $apexTenant->id,
            'process_name' => 'AI Micro-Loan Underwriting & Behavioral Credit Profiling',
            'department' => 'Credit & Data Science',
            'business_purpose' => 'Automated risk scoring to approve instant mobile loans up to N500,000 without collateral.',
            'legal_basis' => 'consent',
            'legal_basis_rationale' => 'NDPA Section 25(1)(a) Explicit consent for automated profile decisioning',
            'data_subject_categories' => ['Loan Applicants'],
            'personal_data_elements' => ['Credit Bureau Records', 'Bank Statement Aggregates', 'Device Telemetry', 'SMS Financial Alerts (Consented)'],
            'special_category_data' => false,
            'recipients' => ['Credit Bureaus (CRC, FirstCentral)'],
            'has_third_party_processor' => true,
            'third_party_names' => ['Mono Technologies', 'Okra'],
            'cross_border_transfer' => false,
            'storage_location' => 'Lagos Hybrid Cloud',
            'retention_period' => '5 years post full loan liquidation',
            'security_measures' => 'Pseudonymized data lake, model explainability logs, human appeal mechanism',
            'requires_dpia' => true,
            'status' => 'verified_by_dpo',
            'reviewed_by' => $apexDpo->id,
            'approved_at' => null,
        ]);

        // 7. DPIA Assessment for High-Risk KYC & AI Scoring
        DpiaAssessment::create([
            'tenant_id' => $apexTenant->id,
            'ropa_id' => $ropa1->id,
            'title' => 'DPIA on Biometric Customer Onboarding & Cloud Verification',
            'description' => 'Comprehensive impact assessment on collecting facial biometrics and verifying live selfies against the Nigerian National Identity Database (NIMC).',
            'high_risk_reasons' => [
                'Processing of biometric data for uniquely identifying individuals (NDPA Sec 30)',
                'Cross-border data transfer to AWS Cloud in Ireland',
                'Large scale processing of financial identity credentials (BVN/NIN)'
            ],
            'nature_of_processing' => 'Liveness facial match check conducted via mobile SDK, encrypted in transit, cross-referenced with NIMC API via licensed partner.',
            'necessity_proportionality_check' => 'Necessary to prevent synthetic identity fraud, money laundering, and comply with mandatory CBN Tier 3 KYC directives.',
            'inherent_likelihood' => 4,
            'inherent_impact' => 4,
            'inherent_risk_score' => 16,
            'inherent_risk_level' => 'high',
            'mitigation_measures' => [
                'Field-level AES-256 encryption applied before database insertion',
                'Biometric templates deleted immediately after match score calculation',
                'Standard Contractual Clauses executed with cloud provider',
                'Regular penetration testing and NDPC compliant audit trail logging'
            ],
            'residual_likelihood' => 2,
            'residual_impact' => 2,
            'residual_risk_score' => 4,
            'residual_risk_level' => 'low',
            'dpo_recommendations' => 'The technical safeguards are proportionate. Recommend quarterly review of cloud IAM permissions and keeping the vendor DPA active.',
            'dpo_sign_off_status' => 'approved',
            'dpco_review_notes' => 'Verified during 2026 DPCO annual audit. Safeguards meet NDPA Section 28 & 39 standards.',
            'approved_by' => $apexDpo->id,
            'approved_at' => now()->subDays(8),
        ]);

        // 8. Statutory NDPC Annual Audit Project
        $auditProject = AuditProject::create([
            'tenant_id' => $apexTenant->id,
            'dpco_firm_id' => $vanguardTenant->id,
            'lead_auditor_id' => $vanguardLeadAuditor->id,
            'audit_year' => 2026,
            'title' => 'NDPC Statutory Annual Data Protection Audit 2026',
            'scope_description' => 'Full-scope statutory compliance audit of Apex Microfinance Bank across all digital banking channels, branch operations, third-party vendor relationships, and IT infrastructure pursuant to NDPA 2023 & NDPC GAID requirements.',
            'overall_score' => 78.50,
            'compliance_level' => 'partially_compliant',
            'status' => 'remediation_in_progress',
            'dpco_seal_code' => 'DPCO-SEAL-2026-APX-883',
            'executive_summary' => 'Apex Microfinance Bank demonstrates substantial progress in governance, data inventory mapping, and technical encryption. Critical remediation is required for cross-border transfer documentation and employee annual refresher training before final filing with NDPC.',
        ]);

        // Audit Checklist items across GAID domains
        $cItem1 = AuditChecklistItem::create([
            'audit_project_id' => $auditProject->id,
            'domain' => 'governance_accountability',
            'section_code' => 'NDPA-SEC-24',
            'question' => 'Has the organization formally designated a qualified Data Protection Officer (DPO) and registered with the NDPC?',
            'guidance' => 'Verify formal appointment letter, board approval minute, and NDPC registration certificate.',
            'status' => 'compliant',
            'max_points' => 5,
            'awarded_points' => 5.00,
            'auditor_findings' => 'DPO formally appointed by Board of Directors on 15 Jan 2026. Registration ref NDPC/DCMI/2026/0891 verified.',
            'client_notes' => 'Appointment letter and board charter attached in evidence vault.',
        ]);

        $cItem2 = AuditChecklistItem::create([
            'audit_project_id' => $auditProject->id,
            'domain' => 'security_measures',
            'section_code' => 'NDPA-SEC-39',
            'question' => 'Are technical and organizational measures implemented to protect personal data against unauthorized access, loss, or alteration (Encryption, MFA, Access Controls)?',
            'guidance' => 'Review network architecture diagrams, AES-256 encryption status for databases, and recent vulnerability assessment report.',
            'status' => 'compliant',
            'max_points' => 5,
            'awarded_points' => 4.50,
            'auditor_findings' => 'AES-256 encryption verified on primary database. MFA enforced on all administrative portals.',
        ]);

        $cItem3 = AuditChecklistItem::create([
            'audit_project_id' => $auditProject->id,
            'domain' => 'third_party_processors',
            'section_code' => 'NDPA-SEC-29',
            'question' => 'Are binding Data Processing Agreements (DPAs) executed with all third-party vendors handling customer personal data?',
            'guidance' => 'Inspect signed DPAs for cloud providers, payment gateways, and IT support contractors.',
            'status' => 'partially_compliant',
            'max_points' => 5,
            'awarded_points' => 2.50,
            'auditor_findings' => 'DPAs executed with Smile Identity and Interswitch. Outstanding DPA with secondary SMS gateway vendor.',
        ]);

        $cItem4 = AuditChecklistItem::create([
            'audit_project_id' => $auditProject->id,
            'domain' => 'data_subject_rights',
            'section_code' => 'NDPA-SEC-34',
            'question' => 'Is there an operational mechanism for data subjects to exercise their access, rectification, and erasure rights within 30 days?',
            'guidance' => 'Review DSAR intake portal, ticketing log, and average SLA resolution timeline.',
            'status' => 'compliant',
            'max_points' => 5,
            'awarded_points' => 4.00,
            'auditor_findings' => 'Automated DSAR portal live on website. 3 requests processed within statutory 30-day timeline.',
        ]);

        // Audit Finding / Remediation
        AuditFinding::create([
            'audit_project_id' => $auditProject->id,
            'checklist_item_id' => $cItem3->id,
            'title' => 'Missing Data Processing Agreement (DPA) with Bulk SMS Gateway Vendor',
            'description' => 'During audit fieldwork, it was observed that SMS Gateway Provider X receives customer phone numbers and OTP payloads without an executed NDPA-compliant Data Processing Agreement.',
            'severity' => 'high',
            'recommendation' => 'Execute standard DPCO-approved DPA template with SMS Provider X specifying data protection obligations, sub-processor restrictions, and breach notification SLAs within 7 days.',
            'remediation_plan' => 'Legal team has dispatched standard DPA contract to vendor on 20 Aug 2026. Awaiting counter-signature.',
            'assigned_to' => $apexAdmin->id,
            'target_resolution_date' => now()->addDays(14),
            'status' => 'in_remediation',
        ]);

        // 9. Active 30-Day DSAR Requests
        DsarRequest::create([
            'tenant_id' => $apexTenant->id,
            'ticket_number' => 'DSAR-2026-1049',
            'request_type' => 'access_copy',
            'data_subject_name' => 'Olumide Adeleke',
            'data_subject_email' => 'olumide.adeleke@gmail.com',
            'data_subject_phone' => '+2348039911223',
            'subject_relationship' => 'customer',
            'request_details' => 'I request a complete copy of all my personal data, transaction history, and credit assessment records held on your mobile banking platform.',
            'id_verified' => true,
            'sla_deadline' => now()->addDays(18), // 18 days remaining out of 30
            'status' => 'investigating',
            'assigned_dpo_id' => $apexDpo->id,
        ]);

        DsarRequest::create([
            'tenant_id' => $apexTenant->id,
            'ticket_number' => 'DSAR-2026-1050',
            'request_type' => 'erasure',
            'data_subject_name' => 'Ngozi Eze',
            'data_subject_email' => 'ngozi.eze@yahoo.com',
            'data_subject_phone' => '+2348051234567',
            'subject_relationship' => 'former_customer',
            'request_details' => 'I closed my account 2 years ago and request the erasure of my profile and marketing contact information.',
            'id_verified' => true,
            'sla_deadline' => now()->addDays(5), // 5 days remaining (urgent!)
            'status' => 'action_taken',
            'assigned_dpo_id' => $apexDpo->id,
        ]);

        // 10. Live 72-Hour Data Breach Incident Scenario
        DataBreach::create([
            'tenant_id' => $apexTenant->id,
            'incident_number' => 'INC-2026-003',
            'title' => 'Suspicious Credential Stuffing Attempt on Mobile API Gateway',
            'nature_of_incident' => 'unauthorized_access',
            'date_time_occurred' => now()->subHours(26),
            'date_time_discovered' => now()->subHours(24),
            'ndpc_notification_deadline' => now()->addHours(48), // 48 hours remaining on 72h clock
            'estimated_affected_subjects' => 140,
            'compromised_data_categories' => ['Masked Phone Numbers', 'Hashed Password Attempts', 'Login IP Geolocation'],
            'risk_assessment_level' => 'medium',
            'is_ndpc_notified' => false,
            'containment_steps_taken' => 'IP rate limiting enforced on API gateway, automated account lockouts triggered for affected accounts, force password reset initiated for 140 users.',
            'remedial_measures' => 'Cloudflare Bot Management rules updated, WAF threshold lowered, customer advisory email prepared.',
            'status' => 'containment_remediation',
            'lead_responder_id' => $apexDpo->id,
        ]);

        // 11. Third-Party Vendors
        Vendor::create([
            'tenant_id' => $apexTenant->id,
            'vendor_name' => 'Smile Identity Nigeria Ltd',
            'service_category' => 'Biometric KYC & Identity Verification',
            'contact_person' => 'Segun Alabi',
            'contact_email' => 'partnerships@smileidentity.com',
            'data_types_processed' => ['NIN', 'BVN', 'Facial Biometric Selfies', 'Full Names'],
            'dpa_signed' => true,
            'dpa_signed_date' => '2025-11-15',
            'risk_rating' => 'low',
            'hosting_country' => 'Ireland / Nigeria',
            'is_cross_border' => true,
            'last_assessment_date' => '2026-01-20',
            'status' => 'active',
        ]);

        Vendor::create([
            'tenant_id' => $apexTenant->id,
            'vendor_name' => 'Paystack Payments Ltd',
            'service_category' => 'Payment Gateway & Card Tokenization',
            'contact_person' => 'Folashade Wright',
            'contact_email' => 'compliance@paystack.com',
            'data_types_processed' => ['Card Tokens', 'Account Numbers', 'Email Addresses', 'Transaction Amounts'],
            'dpa_signed' => true,
            'dpa_signed_date' => '2025-12-01',
            'risk_rating' => 'low',
            'hosting_country' => 'Nigeria',
            'is_cross_border' => false,
            'last_assessment_date' => '2026-02-10',
            'status' => 'active',
        ]);

        Vendor::create([
            'tenant_id' => $apexTenant->id,
            'vendor_name' => 'Infobip Global Messaging',
            'service_category' => 'Transactional SMS & OTP Delivery',
            'contact_person' => 'David Mensah',
            'contact_email' => 'support@infobip.com',
            'data_types_processed' => ['Customer Phone Numbers', 'SMS Text Messages'],
            'dpa_signed' => false, // Missing DPA (triggers finding)
            'risk_rating' => 'high',
            'hosting_country' => 'United Kingdom',
            'is_cross_border' => true,
            'last_assessment_date' => '2026-01-05',
            'status' => 'under_review',
        ]);

        // 12. Cookie Banner & Sample Consents
        CookieBanner::create([
            'tenant_id' => $apexTenant->id,
            'domain' => 'https://apexmfb.ng',
            'theme_color' => '#059669',
            'position' => 'bottom_bar',
            'privacy_policy_url' => 'https://apexmfb.ng/privacy',
            'company_display_name' => 'Apex Microfinance Bank',
            'custom_notice_text' => 'We use necessary cookies for secure online banking and analytics cookies to optimize performance in compliance with NDPA 2023.',
            'is_active' => true,
        ]);

        for ($i = 1; $i <= 10; $i++) {
            CookieConsent::create([
                'tenant_id' => $apexTenant->id,
                'visitor_uuid' => (string) Str::uuid(),
                'accepted_categories' => [
                    'necessary' => true,
                    'functional' => $i % 2 === 0,
                    'analytics' => $i % 3 === 0,
                    'marketing' => $i % 4 === 0,
                ],
                'ip_hash' => hash('sha256', '102.89.23.' . $i),
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'consented_at' => now()->subHours($i * 4),
            ]);
        }

        // 13. Auto-Generated Policies
        Policy::create([
            'tenant_id' => $apexTenant->id,
            'title' => 'Apex MFB Customer Privacy Notice (NDPA 2023 Compliant)',
            'type' => 'privacy_notice_website',
            'content' => "## APEX MICROFINANCE BANK NIGERIA LIMITED\n### CUSTOMER PRIVACY NOTICE (NDPA 2023)\n\n**1. INTRODUCTION**\nApex Microfinance Bank Ltd (\"Apex MFB\", \"we\", \"us\") is committed to safeguarding the personal data of our customers, depositors, loan applicants, and visitors in full compliance with the Nigeria Data Protection Act 2023 (NDPA) and directives of the Nigeria Data Protection Commission (NDPC).\n\n**2. DATA WE COLLECT**\n- Identity Data: Full Name, Date of Birth, BVN, NIN, Passport photo, Facial biometrics.\n- Contact Data: Residential address, Email, Phone number.\n- Financial Data: Bank account records, card tokens, transaction history, loan balances.\n\n**3. LEGAL BASES FOR PROCESSING (NDPA SECTION 25)**\n- Performance of Banking Contract (Section 25(1)(a))\n- Compliance with Legal Obligations under CBN AML/CFT Regulations (Section 25(1)(b))\n- Consent for marketing and automated credit profiling (Section 25(1)(a))\n\n**4. DATA SUBJECT RIGHTS (NDPA SECTIONS 34-38)**\nYou have the right to request access to your records, rectify inaccurate data, request erasure where applicable, object to direct marketing, and request human review of automated credit scoring decisions.\n\n**5. CONTACT OUR DATA PROTECTION OFFICER**\nEmail: dpo@apexmfb.ng | Phone: +2348034567890 | Address: Plot 12, Adeola Odeku St, Victoria Island, Lagos.",
            'version' => '1.0',
            'status' => 'published',
            'published_at' => now()->subDays(15),
            'created_by' => $apexDpo->id,
        ]);

        // 14. Standard NDPA Onboarding Assessment Baseline Questions
        $onboardingQuestions = [
            [
                'category' => 'Governance & Leadership',
                'question_text' => 'Has your organization formally designated a certified Data Protection Officer (DPO) and registered them with the NDPC?',
                'explanation_guide' => 'Required under NDPA Section 24 & 32 for Major Data Controllers processing significant volumes of personal data.',
                'weight_points' => 10,
                'is_mandatory' => true,
                'display_order' => 1,
            ],
            [
                'category' => 'Inventory & RoPA',
                'question_text' => 'Does your organization maintain an up-to-date Record of Processing Activities (RoPA) specifying lawful bases and retention schedules?',
                'explanation_guide' => 'Mandated by NDPA Section 24 across all departments handling customer, employee, or vendor data.',
                'weight_points' => 10,
                'is_mandatory' => true,
                'display_order' => 2,
            ],
            [
                'category' => 'Data Subject Rights',
                'question_text' => 'Do you have an established pipeline to fulfill Data Subject Access Requests (DSARs) within the statutory 30-calendar-day SLA?',
                'explanation_guide' => 'Pursuant to NDPA Sections 34-38, data subjects have enforceable rights to access, rectify, or erase their records.',
                'weight_points' => 10,
                'is_mandatory' => true,
                'display_order' => 3,
            ],
            [
                'category' => 'Incident Response',
                'question_text' => 'Is there a documented 72-hour Data Breach Response Protocol for notifying the NDPC upon discovery of a high-risk security breach?',
                'explanation_guide' => 'NDPA Section 40 requires notification to the Commission within 72 hours where feasible.',
                'weight_points' => 10,
                'is_mandatory' => true,
                'display_order' => 4,
            ],
            [
                'category' => 'Third-Party Processors',
                'question_text' => 'Do all third-party cloud hosting, payment gateway, and software vendors have executed Data Processing Agreements (DPAs)?',
                'explanation_guide' => 'NDPA Section 29 requires binding contractual guarantees from all data processors.',
                'weight_points' => 10,
                'is_mandatory' => true,
                'display_order' => 5,
            ],
        ];

        foreach ($onboardingQuestions as $q) {
            OnboardingQuestion::create($q);
        }
    }
}
