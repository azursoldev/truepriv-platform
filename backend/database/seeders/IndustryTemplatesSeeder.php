<?php

namespace Database\Seeders;

use App\Models\IndustryTemplate;
use Illuminate\Database\Seeder;

class IndustryTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        IndustryTemplate::truncate();

        // 1. Fintech & Payments
        IndustryTemplate::create([
            'industry_name' => 'Fintech & Payment Service Providers',
            'slug' => 'fintech-payments',
            'icon' => 'credit-card',
            'description' => 'Tailored for CBN-licensed PSPs, Mobile Money Operators, Lending Apps, and Digital Wallets under NDPA 2023 & CBN Consumer Protection Framework.',
            'default_ropa' => [
                [
                    'process_name' => 'Customer Digital Onboarding & KYC / BVN Verification',
                    'department' => 'Compliance & Risk',
                    'business_purpose' => 'Verification of customer identity to prevent fraud and comply with CBN Anti-Money Laundering (AML/CFT) & NDPA guidelines.',
                    'legal_basis' => 'legal_obligation',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(b) & CBN AML/CFT Regulations 2022',
                    'data_subject_categories' => ['Retail Customers', 'Corporate Directors', 'Guarantors'],
                    'personal_data_elements' => ['Full Name', 'Date of Birth', 'Bank Verification Number (BVN)', 'National Identification Number (NIN)', 'Facial Biometric Selfie', 'Residential Address', 'Utility Bill'],
                    'special_category_data' => true,
                    'recipients' => ['Nigeria Inter-Bank Settlement System (NIBSS)', 'NIMC', 'Internal Fraud Monitoring Team'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Smile Identity', 'VerifyMe Nigeria', 'Amazon Web Services'],
                    'cross_border_transfer' => true,
                    'transfer_destination_countries' => ['Ireland', 'United States'],
                    'transfer_safeguards' => 'standard_contractual_clauses',
                    'storage_location' => 'AWS eu-west-1 (Ireland) Encrypted RDS',
                    'retention_period' => '6 years after account termination (CBN AML standard)',
                    'security_measures' => 'AES-256 field-level encryption for BVN/NIN, TLS 1.3 in transit, strict RBAC, automated access audit logging',
                    'requires_dpia' => true,
                ],
                [
                    'process_name' => 'Payment Gateway & Card Transaction Processing',
                    'department' => 'Engineering & Payments',
                    'business_purpose' => 'Facilitating debit/credit card charges, fund transfers, and settlement payouts.',
                    'legal_basis' => 'contract',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(a) Performance of financial services contract',
                    'data_subject_categories' => ['Cardholders', 'Merchants', 'Beneficiaries'],
                    'personal_data_elements' => ['Primary Account Number (Masked PAN)', 'Cardholder Name', 'Expiry Date', 'Transaction Amount', 'IP Address', 'Device Fingerprint'],
                    'special_category_data' => false,
                    'recipients' => ['Card Schemes (Visa, Mastercard, Verve)', 'Acquiring Banks', 'NIBSS'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Interswitch', 'Paystack', 'Flutterwave'],
                    'cross_border_transfer' => false,
                    'storage_location' => 'PCI-DSS Level 1 Compliant Vault (Lagos DC & Dublin)',
                    'retention_period' => '7 years for financial transaction & tax records',
                    'security_measures' => 'PCI-DSS Level 1 tokenization, HSM key management, real-time transaction monitoring',
                    'requires_dpia' => false,
                ],
                [
                    'process_name' => 'Automated Credit Scoring & Alternative Data Underwriting',
                    'department' => 'Credit & Data Science',
                    'business_purpose' => 'Assessing loan eligibility and default probabilities using behavioral and credit bureau history.',
                    'legal_basis' => 'consent',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(a) Explicit consent required for automated decision profiling',
                    'data_subject_categories' => ['Loan Applicants'],
                    'personal_data_elements' => ['Bank Statement History', 'Credit Bureau Scores (CRC, FirstCentral)', 'Device Metadata', 'SMS Transaction Logs (with consent)', 'Salary Income'],
                    'special_category_data' => false,
                    'recipients' => ['Credit Bureaus', 'Underwriting Team'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Mono Technologies', 'Okra Inc', 'CRC Credit Bureau'],
                    'cross_border_transfer' => false,
                    'storage_location' => 'Local Cloud Database',
                    'retention_period' => '5 years post loan liquidation',
                    'security_measures' => 'Pseudonymized data lake, restricted algorithmic access, right to human review under NDPA Sec 37',
                    'requires_dpia' => true,
                ],
                [
                    'process_name' => 'Employee Payroll & Tax / Pension Administration',
                    'department' => 'Human Resources & Finance',
                    'business_purpose' => 'Monthly compensation disbursement, PAYE tax remittance to LIRS/FIRS, and PenCom pension remittance.',
                    'legal_basis' => 'legal_obligation',
                    'legal_basis_rationale' => 'Nigeria Labour Act, Pension Reform Act 2014, and Personal Income Tax Act',
                    'data_subject_categories' => ['Full-time Employees', 'Contractors'],
                    'personal_data_elements' => ['Full Name', 'Bank Account Number', 'Tax ID (TIN)', 'Pension RSA PIN', 'Next of Kin Details', 'Monthly Salary & Deductions'],
                    'special_category_data' => false,
                    'recipients' => ['Pension Fund Administrators (PFAs)', 'Lagos State Internal Revenue Service (LIRS)', 'Commercial Banks'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['SeamlessHR', 'Zenith Bank'],
                    'cross_border_transfer' => false,
                    'storage_location' => 'HR Cloud Portal (Encrypted)',
                    'retention_period' => '7 years following employment termination',
                    'security_measures' => 'Role-based access limited to HR & Finance leads, encrypted backups, MFA',
                    'requires_dpia' => false,
                ],
                [
                    'process_name' => 'Customer Care Ticket Resolution & Call Recording',
                    'department' => 'Customer Experience',
                    'business_purpose' => 'Handling customer disputes, technical inquiries, quality assurance, and training.',
                    'legal_basis' => 'legitimate_interest',
                    'legal_basis_rationale' => 'Legitimate interest in maintaining service quality and resolving dispute records under NDPA Sec 25(1)(f)',
                    'data_subject_categories' => ['App Users', 'Callers'],
                    'personal_data_elements' => ['Voice Recording', 'Customer Name', 'Email', 'Chat Transcripts', 'Account ID'],
                    'special_category_data' => false,
                    'recipients' => ['Support Agents', 'QA Team'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Zendesk', 'Freshworks', 'Twilio'],
                    'cross_border_transfer' => true,
                    'transfer_destination_countries' => ['United States'],
                    'transfer_safeguards' => 'standard_contractual_clauses',
                    'storage_location' => 'Zendesk US Data Center',
                    'retention_period' => '2 years from ticket closure',
                    'security_measures' => 'Pre-call consent announcement, encrypted audio files, role-based ticket permissions',
                    'requires_dpia' => false,
                ]
            ],
            'default_dpia_triggers' => [
                'Biometric processing (Facial match against NIMC database)',
                'Automated loan approval algorithms without immediate human review',
                'Large scale processing of financial transaction records'
            ],
            'default_policies' => [
                'Fintech Consumer Privacy Notice',
                'Data Subject Rights Handling Procedure',
                'Cross-Border Financial Data Transfer Standard'
            ]
        ]);

        // 2. Healthcare & Telemedicine
        IndustryTemplate::create([
            'industry_name' => 'Healthcare, Hospitals & Telemedicine',
            'slug' => 'healthcare-telemedicine',
            'icon' => 'activity',
            'description' => 'Engineered for hospitals, diagnostic centers, HMOs, and telemedicine platforms handling special category health data under NDPA Sec 30.',
            'default_ropa' => [
                [
                    'process_name' => 'Patient Medical Records & Electronic Health Record (EHR) Management',
                    'department' => 'Clinical Operations & Records',
                    'business_purpose' => 'Diagnosis, treatment planning, prescription management, and clinical audit.',
                    'legal_basis' => 'vital_interest',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(c) & Section 30(1)(c) for Provision of health care services',
                    'data_subject_categories' => ['Patients', 'Emergency Contacts', 'Next of Kin'],
                    'personal_data_elements' => ['Full Name', 'Medical History', 'Lab & Diagnostic Test Results', 'Blood Group / Genotype', 'Prescriptions', 'Biometric Thumbprint'],
                    'special_category_data' => true,
                    'recipients' => ['Attending Physicians', 'Diagnostic Laboratories', 'Pharmacy Department'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Helium Health', 'Helium Doc EHR Cloud'],
                    'cross_border_transfer' => false,
                    'storage_location' => 'Encrypted Local Hospital Server & AWS Lagos Local Zone',
                    'retention_period' => '10 years following last patient contact (Federal Ministry of Health standard)',
                    'security_measures' => 'Strict doctor-patient confidentiality safeguards, access restricted to assigned care team, audit logging of all chart views',
                    'requires_dpia' => true,
                ],
                [
                    'process_name' => 'HMO Health Insurance Pre-Authorization & Claims Processing',
                    'department' => 'Billing & Accounts',
                    'business_purpose' => 'Verifying insurance coverage, obtaining procedure pre-authorization, and submitting reimbursement claims.',
                    'legal_basis' => 'contract',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(a) Execution of healthcare insurance policy contract',
                    'data_subject_categories' => ['Insured Enrollees'],
                    'personal_data_elements' => ['Enrollee Policy Number', 'Employer Name', 'ICD-10 Diagnostic Codes', 'Billed Procedure Amounts'],
                    'special_category_data' => true,
                    'recipients' => ['Health Maintenance Organizations (HMOs)', 'National Health Insurance Authority (NHIA)'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Reliance Health', 'AXA Mansard Health', 'Hygeia HMO'],
                    'cross_border_transfer' => false,
                    'storage_location' => 'Secured Cloud Portal',
                    'retention_period' => '6 years for insurance claims audit',
                    'security_measures' => 'Encrypted EDI claims transmission, role-based access for billing officers',
                    'requires_dpia' => false,
                ]
            ],
            'default_dpia_triggers' => [
                'Special category health data and genetic/biometric data processing',
                'Telemedicine remote video consultations and recorded diagnostic sessions'
            ],
            'default_policies' => [
                'Hospital Clinical Data Privacy Notice',
                'Confidentiality & EHR Access Protocol for Medical Personnel'
            ]
        ]);

        // 3. E-Commerce & Retail Marketplaces
        IndustryTemplate::create([
            'industry_name' => 'E-Commerce & Digital Marketplaces',
            'slug' => 'ecommerce-retail',
            'icon' => 'shopping-bag',
            'description' => 'Designed for online stores, logistics delivery platforms, merchant marketplaces, and direct-to-consumer digital brands.',
            'default_ropa' => [
                [
                    'process_name' => 'Customer Order Fulfillment & Doorstep Delivery',
                    'department' => 'Logistics & Dispatch',
                    'business_purpose' => 'Picking, packaging, and dispatching physical orders to buyer delivery addresses.',
                    'legal_basis' => 'contract',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(a) Fulfillment of commercial sale contract',
                    'data_subject_categories' => ['Online Shoppers'],
                    'personal_data_elements' => ['Full Name', 'Delivery Address', 'Phone Number', 'Order Items', 'GPS Coordinates'],
                    'special_category_data' => false,
                    'recipients' => ['Third-party Courier Dispatchers', 'Fulfillment Center Staff'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['GIG Logistics', 'Kwik Delivery', 'DHL Nigeria'],
                    'cross_border_transfer' => false,
                    'storage_location' => 'E-Commerce Database (Lagos / Frankfurt)',
                    'retention_period' => '3 years after order completion',
                    'security_measures' => 'Masked customer phone numbers for dispatch riders, TLS encryption on driver mobile apps',
                    'requires_dpia' => false,
                ],
                [
                    'process_name' => 'Targeted Marketing, Abandoned Cart Reminders & Newsletters',
                    'department' => 'Growth & Digital Marketing',
                    'business_purpose' => 'Promoting discounts, remarketing abandoned checkout items, and sending product newsletters.',
                    'legal_basis' => 'consent',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(a) & GAID rules for electronic direct marketing',
                    'data_subject_categories' => ['Newsletter Subscribers', 'Website Visitors'],
                    'personal_data_elements' => ['Email Address', 'Browsing History', 'Wishlist Items', 'Purchase History'],
                    'special_category_data' => false,
                    'recipients' => ['Marketing Automation Platforms'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Mailchimp', 'Klaviyo', 'Google Analytics'],
                    'cross_border_transfer' => true,
                    'transfer_destination_countries' => ['United States'],
                    'transfer_safeguards' => 'standard_contractual_clauses',
                    'storage_location' => 'US Cloud Server',
                    'retention_period' => 'Until consent withdrawal / opt-out',
                    'security_measures' => '1-click unsubscribe mechanism in all promotional emails, cookie consent banner controls',
                    'requires_dpia' => false,
                ]
            ],
            'default_dpia_triggers' => [
                'Large scale customer behavioral tracking and algorithmic recommendation engines',
                'Third-party tracking pixel integrations'
            ],
            'default_policies' => [
                'E-Commerce Website Privacy Notice',
                'Cookie Policy & Opt-out Guide'
            ]
        ]);

        // 4. Telecommunications & Internet Service Providers
        IndustryTemplate::create([
            'industry_name' => 'Telecommunications & ISPs',
            'slug' => 'telecoms-isps',
            'icon' => 'wifi',
            'description' => 'Compliant with NCC SIM Registration Regulations and NDPA 2023 for Telcos, Fibre ISPs, and VoIP providers.',
            'default_ropa' => [
                [
                    'process_name' => 'Subscriber SIM Registration & Biometric Capture',
                    'department' => 'Regulatory Affairs & Field Sales',
                    'business_purpose' => 'Mandatory subscriber registration and NIN linkage under Nigerian Communications Commission (NCC) rules.',
                    'legal_basis' => 'legal_obligation',
                    'legal_basis_rationale' => 'NCC SIM Registration Regulations & NDPA Section 25(1)(b)',
                    'data_subject_categories' => ['Subscribers', 'SIM Agents'],
                    'personal_data_elements' => ['Full Name', '10 Fingerprint Biometrics', 'Facial Portrait', 'NIN', 'Residential Address', 'MSISDN Number'],
                    'special_category_data' => true,
                    'recipients' => ['NCC Central Repository', 'NIMC', 'Law Enforcement (upon valid court warrant)'],
                    'has_third_party_processor' => false,
                    'cross_border_transfer' => false,
                    'storage_location' => 'National Tier III Data Center (Abuja & Lagos)',
                    'retention_period' => 'Duration of active subscription + 5 years post-deactivation',
                    'security_measures' => 'End-to-end encrypted biometric capture kits, HSM-backed verification, zero local device storage',
                    'requires_dpia' => true,
                ]
            ],
            'default_dpia_triggers' => [
                'Nationwide biometric subscriber database processing',
                'Cell tower location data and call detail record (CDR) analytics'
            ],
            'default_policies' => [
                'Subscriber Privacy Notice',
                'Law Enforcement Data Request Handling Procedure'
            ]
        ]);

        // 5. Higher Education & EduTech
        IndustryTemplate::create([
            'industry_name' => 'Education & EduTech Platforms',
            'slug' => 'education-edutech',
            'icon' => 'book-open',
            'description' => 'For universities, private secondary schools, and online learning platforms managing student, parent, and minor records.',
            'default_ropa' => [
                [
                    'process_name' => 'Student Academic Records, Transcripts & Exam Grading',
                    'department' => 'Academic Affairs & Registry',
                    'business_purpose' => 'Enrollment, grade point assessment, degree certification, and transcript generation.',
                    'legal_basis' => 'contract',
                    'legal_basis_rationale' => 'NDPA Section 25(1)(a) Educational enrollment contract',
                    'data_subject_categories' => ['Students', 'Minors (under 18 with parental consent)', 'Parents/Guardians'],
                    'personal_data_elements' => ['Full Name', 'Matriculation Number', 'Birth Certificate', 'Exam Scores & GPA', 'Parent Contact Information', 'Passport Photograph'],
                    'special_category_data' => false,
                    'recipients' => ['National Universities Commission (NUC)', 'JAMB', 'Academic Registry'],
                    'has_third_party_processor' => true,
                    'third_party_names' => ['Canvas LMS', 'Google Workspace for Education'],
                    'cross_border_transfer' => true,
                    'transfer_destination_countries' => ['United States', 'Ireland'],
                    'transfer_safeguards' => 'standard_contractual_clauses',
                    'storage_location' => 'Encrypted Educational Cloud',
                    'retention_period' => 'Permanent retention for degree verification',
                    'security_measures' => 'Parental consent workflows for minor students under NDPA Sec 31, transcript verification encryption',
                    'requires_dpia' => false,
                ]
            ],
            'default_dpia_triggers' => [
                'Processing personal data of children and vulnerable learners (NDPA Section 31)',
                'AI-proctored examination monitoring with webcams and screen recording'
            ],
            'default_policies' => [
                'Student & Parent Privacy Notice',
                'Child Data Protection & Parental Consent Policy'
            ]
        ]);
    }
}
