import urllib.request
import urllib.error
import json
import random
import sys

BASE_URL = 'https://truepriv-saas.vercel.app/api/v1'

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
            parsed = json.loads(resp_body)
        except Exception:
            parsed = {'error': resp_body}
        return e.code, parsed
    except Exception as e:
        return 0, {'error': str(e)}

results = {
    'passed': [],
    'failed': []
}

def record_test(name, success, details=""):
    if success:
        print(f"  [PASS] {name} - {details}")
        results['passed'].append(name)
    else:
        print(f"  [FAIL] {name} - {details}")
        results['failed'].append((name, details))

print("=================================================================")
print("STARTING COMPREHENSIVE MILESTONE 2 VERIFICATION")
print("Target: https://truepriv-saas.vercel.app/api/v1")
print("=================================================================\n")

# -------------------------------------------------------------
# 1. REGISTRATION VERIFICATION
# -------------------------------------------------------------
print("--- TEST SUITE 1: REGISTRATION FLOW ---")
rand_id = random.randint(10000, 99999)
reg_users = [
    {
        'type': 'corporate',
        'name': f'Verif Corp Admin {rand_id}',
        'email': f'test.corp.{rand_id}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'corporate',
        'organization_name': f'Verif Corp Org {rand_id}'
    },
    {
        'type': 'outsourced_dpo',
        'name': f'Verif DPO Lead {rand_id}',
        'email': f'test.dpo.{rand_id}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'outsourced_dpo',
        'organization_name': f'Verif DPO Advisory {rand_id}'
    },
    {
        'type': 'dpco_firm',
        'name': f'Verif DPCO Auditor {rand_id}',
        'email': f'test.dpco.{rand_id}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'dpco_firm',
        'organization_name': f'Verif DPCO Assurance {rand_id}'
    }
]

created_tokens = {}

for u in reg_users:
    code, res = api_call('/auth/register', method='POST', data=u)
    ok = (code == 201 or code == 200) and ('token' in res or (res.get('data') and 'token' in res.get('data', {})))
    token = res.get('token') or res.get('data', {}).get('token')
    created_tokens[u['type']] = token
    record_test(
        f"Register {u['type']} profile",
        ok,
        f"HTTP {code} | Role: {res.get('user', {}).get('role') or res.get('data', {}).get('user', {}).get('role')}"
    )

# Duplicate registration check
dup_code, dup_res = api_call('/auth/register', method='POST', data=reg_users[0])
record_test(
    "Duplicate Email Rejection (Validation)",
    dup_code in [400, 422],
    f"HTTP {dup_code} returned properly on existing email"
)

# -------------------------------------------------------------
# 2. LOGIN & AUTHENTICATION VERIFICATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 2: LOGIN & AUTHENTICATION ---")
existing_logins = [
    ('corp.user.6820@example.com', 'SecurePassword2026!', 'corporate', 'corporate_admin'),
    ('dpo.user.9344@example.com', 'SecurePassword2026!', 'outsourced_dpo', 'outsourced_dpo'),
    ('b.adeyemi@alphaltd.ng', 'Password123!', 'dpco_firm', 'dpco_lead_auditor'),
]

login_tokens = {}

for email, pwd, ptype, expected_role in existing_logins:
    code, res = api_call('/auth/login', method='POST', data={'email': email, 'password': pwd})
    token = res.get('token')
    login_tokens[ptype] = token
    user = res.get('user', {})
    tenant = res.get('tenant', {})
    role_ok = (user.get('role') == expected_role)
    token_ok = bool(token)
    record_test(
        f"Login {ptype} ({email})",
        code == 200 and token_ok and role_ok,
        f"HTTP {code} | Token issued | Role: {user.get('role')} | Tenant: {tenant.get('name')}"
    )

# Test Invalid Password
inv_code, inv_res = api_call('/auth/login', method='POST', data={'email': 'corp.user.6820@example.com', 'password': 'WrongPassword123'})
record_test(
    "Invalid Credentials Rejection",
    inv_code in [401, 422],
    f"HTTP {inv_code} properly returned for bad password"
)

# -------------------------------------------------------------
# 3. GET /auth/me & SESSION IDENTITY
# -------------------------------------------------------------
print("\n--- TEST SUITE 3: AUTHENTICATED SESSION /auth/me ---")
for ptype, token in login_tokens.items():
    if not token:
        continue
    code, res = api_call('/auth/me', method='GET', token=token)
    user = res.get('user', {})
    tenant = res.get('tenant', {})
    record_test(
        f"/auth/me for {ptype}",
        code == 200 and user.get('email'),
        f"HTTP {code} | Email: {user.get('email')} | Tenant: {tenant.get('name')} (Type: {tenant.get('type')})"
    )

# -------------------------------------------------------------
# 4. ROLE PERMISSIONS & PORTAL ACCESS RESTRICTIONS
# -------------------------------------------------------------
print("\n--- TEST SUITE 4: ROLE PERMISSIONS & ACCESS CONTROL ---")
corp_token = login_tokens.get('corporate')
dpo_token = login_tokens.get('outsourced_dpo')
dpco_token = login_tokens.get('dpco_firm')

# Corporate should NOT be allowed on /dashboard/portfolio
code_corp_port, res_corp_port = api_call('/dashboard/portfolio', method='GET', token=corp_token)
record_test(
    "Corporate user restricted from /dashboard/portfolio",
    code_corp_port == 403,
    f"HTTP {code_corp_port} (Forbidden as expected)"
)

# Outsourced DPO MUST be allowed on /dashboard/portfolio
code_dpo_port, res_dpo_port = api_call('/dashboard/portfolio', method='GET', token=dpo_token)
dpo_has_clients = 'clients' in res_dpo_port
record_test(
    "Outsourced DPO allowed on /dashboard/portfolio",
    code_dpo_port == 200 and dpo_has_clients,
    f"HTTP {code_dpo_port} | Clients count: {res_dpo_port.get('clients_count')}"
)

# DPCO Auditor MUST be allowed on /dashboard/portfolio
code_dpco_port, res_dpco_port = api_call('/dashboard/portfolio', method='GET', token=dpco_token)
dpco_has_clients = 'clients' in res_dpco_port
record_test(
    "DPCO Lead Auditor allowed on /dashboard/portfolio",
    code_dpco_port == 200 and dpco_has_clients,
    f"HTTP {code_dpco_port} | Clients count: {res_dpco_port.get('clients_count')}"
)

# -------------------------------------------------------------
# 5. DASHBOARD STRUCTURES & METRICS
# -------------------------------------------------------------
print("\n--- TEST SUITE 5: DASHBOARD STRUCTURES & METRICS ---")

# Corporate Dashboard Metrics
code_metrics, res_metrics = api_call('/dashboard/metrics', method='GET', token=corp_token)
has_gauge = 'compliance_gauge' in res_metrics
has_ropa = 'ropa' in res_metrics
has_dpia = 'dpia' in res_metrics
has_dsar = 'dsar' in res_metrics
has_breaches = 'breaches' in res_metrics
has_vendors = 'vendors' in res_metrics
has_audits = 'audits' in res_metrics

all_metrics_present = (
    code_metrics == 200 and 
    has_gauge and 
    has_ropa and 
    has_dpia and 
    has_dsar and 
    has_breaches and 
    has_vendors and 
    has_audits
)
record_test(
    "Corporate Dashboard Metrics Structure",
    all_metrics_present,
    f"Score: {res_metrics.get('compliance_gauge', {}).get('score')}% | RoPA: {res_metrics.get('ropa', {}).get('total')} | DPIA: {res_metrics.get('dpia', {}).get('total')} | Breaches: {res_metrics.get('breaches', {}).get('active_incidents')}"
)

# Role matrix endpoint
code_matrix, res_matrix = api_call('/roles/matrix', method='GET', token=corp_token)
roles_list = res_matrix.get('data') or res_matrix.get('roles') or []
record_test(
    "RBAC Roles & Permissions Matrix (/roles/matrix)",
    code_matrix == 200 and len(roles_list) > 0,
    f"HTTP {code_matrix} | Available roles documented: {len(roles_list)}"
)

# Audits Endpoint (DPCO Core Workflow)
code_audits, res_audits = api_call('/audits', method='GET', token=corp_token)
record_test(
    "Statutory Audits Registry (/audits)",
    code_audits == 200 and 'data' in res_audits,
    f"HTTP {code_audits} | Total audits: {len(res_audits.get('data', []))}"
)

# RoPA Endpoint
code_ropa, res_ropa = api_call('/ropa', method='GET', token=corp_token)
record_test(
    "RoPA Activities Registry (/ropa)",
    code_ropa == 200 and 'data' in res_ropa,
    f"HTTP {code_ropa} | Total RoPA items: {len(res_ropa.get('data', []))}"
)

# DPIA Endpoint
code_dpia, res_dpia = api_call('/dpia', method='GET', token=corp_token)
record_test(
    "DPIA Assessment Registry (/dpia)",
    code_dpia == 200 and 'data' in res_dpia,
    f"HTTP {code_dpia} | Total DPIAs: {len(res_dpia.get('data', []))}"
)

# DSAR Endpoint
code_dsar, res_dsar = api_call('/dsars', method='GET', token=corp_token)
record_test(
    "30-Day DSAR SLA Desk (/dsars)",
    code_dsar == 200 and 'data' in res_dsar,
    f"HTTP {code_dsar} | Total DSARs: {len(res_dsar.get('data', []))}"
)

# Breaches Endpoint
code_breaches, res_breaches = api_call('/breaches', method='GET', token=corp_token)
record_test(
    "72-Hour Breach Registry (/breaches)",
    code_breaches == 200 and 'data' in res_breaches,
    f"HTTP {code_breaches} | Total Breaches: {len(res_breaches.get('data', []))}"
)

# Vendors Endpoint
code_vendors, res_vendors = api_call('/vendors', method='GET', token=corp_token)
record_test(
    "Vendor TPRM Registry (/vendors)",
    code_vendors == 200 and 'data' in res_vendors,
    f"HTTP {code_vendors} | Total Vendors: {len(res_vendors.get('data', []))}"
)

print("\n=================================================================")
print(f"VERIFICATION SUMMARY: {len(results['passed'])} PASSED | {len(results['failed'])} FAILED")
print("=================================================================")
if results['failed']:
    print("FAILED TESTS:")
    for f in results['failed']:
        print(f" - {f[0]}: {f[1]}")
    sys.exit(1)
else:
    print("ALL MILESTONE 2 REQUIREMENTS CONFIRMED WORKING!")
    sys.exit(0)
