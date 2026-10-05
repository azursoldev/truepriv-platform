import urllib.request
import json
import sys

BASE_URL = 'https://dpoportal.auraa-digital.com/public/api/v1'

def api_call(path, method='GET', data=None, token=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {'Accept': 'application/json'}
    if token:
        req_headers['Authorization'] = f"Bearer {token}"
    if data is not None:
        req_headers['Content-Type'] = 'application/json'
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    if headers:
        req_headers.update(headers)
    
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode('utf-8')
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(resp_body)
        except Exception:
            return e.code, {'error': resp_body}
    except Exception as e:
        return 0, {'error': str(e)}

print("1. Logging into Corporate Account (corp.user.6820@example.com)...")
code, login_res = api_call('/auth/login', method='POST', data={
    'email': 'corp.user.6820@example.com',
    'password': 'SecurePassword2026!'
})

if code != 200:
    print(f"Failed to login: {code} - {login_res}")
    sys.exit(1)

token = login_res['token']
tenant_id = login_res['tenant']['id']
tenant_slug = login_res['tenant']['slug']
print(f"   Logged in! Tenant: {login_res['tenant']['name']} ({tenant_slug})")

# 2. Seed Vendors
print("2. Seeding TPRM Vendors...")
vendors_data = [
    {
        'vendor_name': 'Amazon Web Services (AWS)',
        'service_category': 'Cloud Infrastructure & Database Hosting',
        'cookie_category': 'strictly_necessary',
        'data_types_processed': ['Financial records', 'Account metadata', 'Transaction logs'],
        'dpa_signed': True,
        'dpa_signed_date': '2026-01-15',
        'risk_rating': 'medium',
        'hosting_country': 'Ireland (EU)',
        'is_cross_border': True,
        'status': 'active'
    },
    {
        'vendor_name': 'Interswitch Africa Payments',
        'service_category': 'Core Payment Switching & Settlement',
        'cookie_category': 'strictly_necessary',
        'data_types_processed': ['Card PANs', 'BVN / Identity hashes', 'Phone numbers'],
        'dpa_signed': True,
        'dpa_signed_date': '2026-02-10',
        'risk_rating': 'low',
        'hosting_country': 'Nigeria (Galaxy Backbone)',
        'is_cross_border': False,
        'status': 'active'
    },
    {
        'vendor_name': 'Google Cloud Analytics',
        'service_category': 'Digital Channel Telemetry & Event Analytics',
        'cookie_category': 'analytics',
        'data_types_processed': ['IP addresses', 'Browser user agents', 'Clickstream logs'],
        'dpa_signed': True,
        'dpa_signed_date': '2026-03-01',
        'risk_rating': 'medium',
        'hosting_country': 'United States',
        'is_cross_border': True,
        'status': 'active'
    }
]

for v in vendors_data:
    v_code, v_res = api_call('/vendors', method='POST', data=v, token=token)
    print(f"   Vendor [{v['vendor_name']}]: HTTP {v_code}")

# 3. Seed DPIA Assessments
print("3. Seeding DPIA Assessments...")
dpia_data = [
    {
        'title': 'Biometric KYC & Facial Verification Engine',
        'description': 'Automated real-time facial matching against NIMC NIN database for mobile onboarding.',
        'high_risk_reasons': ['Large scale processing of biometric data', 'Systematic monitoring and scoring'],
        'nature_of_processing': 'Automated biometric feature vector extraction via mobile SDK',
        'necessity_proportionality_check': 'Required under CBN KYC guidelines and NDPA Section 35',
        'inherent_likelihood': 4,
        'inherent_impact': 4,
        'mitigation_measures': ['Full AES-256 hardware security module encryption', 'No raw biometric images retained'],
        'residual_likelihood': 1,
        'residual_impact': 2,
        'dpo_recommendations': 'Approved for deployment with periodic annual algorithm bias review.'
    },
    {
        'title': 'Autonomous Micro-Lending Behavioral Credit Scoring',
        'description': 'Machine learning model predicting repayment probability using telco airtime and mobile data patterns.',
        'high_risk_reasons': ['Automated decision making with legal/financial impact'],
        'nature_of_processing': 'Batch heuristic profiling and risk assessment',
        'necessity_proportionality_check': 'Explicit user consent collected prior to model scoring',
        'inherent_likelihood': 3,
        'inherent_impact': 4,
        'mitigation_measures': ['Opt-out mechanism provided', 'Human-in-the-loop review for adverse decisions'],
        'residual_likelihood': 2,
        'residual_impact': 2,
        'dpo_recommendations': 'Maintain full explanation ledger for any loan rejection over NGN 500,000.'
    }
]

for d in dpia_data:
    d_code, d_res = api_call('/dpia', method='POST', data=d, token=token)
    print(f"   DPIA [{d['title'][:35]}...]: HTTP {d_code}")

# 4. Seed Data Breach Incident
print("4. Seeding Data Breach Log...")
breach_data = {
    'title': 'Targeted Phishing Attempt on Customer Support Desk',
    'nature_of_incident': 'phishing_credential_theft',
    'date_time_occurred': '2026-09-28 10:15:00',
    'date_time_discovered': '2026-09-28 11:00:00',
    'estimated_affected_subjects': 0,
    'compromised_data_categories': ['Work email addresses only'],
    'risk_assessment_level': 'low',
    'containment_steps_taken': 'Mailbox credentials reset immediately, 2FA revoked and re-enrolled.',
    'remedial_measures': 'All team members underwent refresher training on spear-phishing.'
}
b_code, b_res = api_call('/breaches', method='POST', data=breach_data, token=token)
print(f"   Breach Log: HTTP {b_code}")

# 5. Submit Public DSAR
print("5. Submitting Sample Public DSAR...")
dsar_data = {
    'tenant_slug': tenant_slug,
    'subject_name': 'Chukwuma Eze',
    'subject_email': 'chukwuma.eze@example.com',
    'subject_phone': '+234 802 334 9911',
    'request_type': 'access',
    'details': 'Kindly provide a copy of all personal transaction records and credit check logs linked to my account.',
    'identity_proof_type': 'NIN Slip'
}
dsar_code, dsar_res = api_call('/public/dsar/submit', method='POST', data=dsar_data)
print(f"   Public DSAR: HTTP {dsar_code} (Ticket: {dsar_res.get('ticket_number') or dsar_res.get('data', {}).get('ticket_number')})")

# 6. Submit NDPA MDC Assessment
print("6. Submitting NDPA MDC Onboarding Assessment...")
onboarding_data = {
    'answers': {
        'annual_data_subjects': 'above_100k',
        'processes_sensitive_personal_data': True,
        'critical_national_information_infrastructure': True,
        'dpo_designated': True,
        'annual_turnover_above_cbn_threshold': True
    }
}
onb_code, onb_res = api_call('/onboarding/submit', method='POST', data=onboarding_data, token=token)
print(f"   MDC Onboarding: HTTP {onb_code}")

# 7. Check Updated Dashboard Metrics
print("7. Fetching Updated Dashboard Metrics...")
m_code, m_res = api_call('/dashboard/metrics', method='GET', token=token)
if m_code == 200:
    print(f"   Compliance Score: {m_res.get('compliance_gauge', {}).get('score')}%")
    print(f"   Status: {m_res.get('compliance_gauge', {}).get('status')}")
    print(f"   RoPA count: {m_res.get('ropa', {}).get('total')}")
    print(f"   DPIA count: {m_res.get('dpia', {}).get('total')}")
    print(f"   Vendors count: {m_res.get('vendors', {}).get('total_processors')}")
    print(f"   DSAR open: {m_res.get('dsar', {}).get('open_requests')}")
    print(f"   Breaches active: {m_res.get('breaches', {}).get('active_incidents')}")
    print("\nCorporate Dashboard is now rich, realistic, and fully functional!")
else:
    print(f"   Failed to fetch metrics: {m_code} - {m_res}")
