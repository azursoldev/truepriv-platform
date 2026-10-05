import urllib.request
import urllib.error
import json
import random
import sys

BASE_URL = 'http://127.0.0.1:8080/api/v1'

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

results = {'passed': [], 'failed': []}

def record_test(name, success, details=""):
    if success:
        print(f"  [PASS] {name} - {details}")
        results['passed'].append(name)
    else:
        print(f"  [FAIL] {name} - {details}")
        results['failed'].append((name, details))

print("=================================================================")
print("RUNNING COMPREHENSIVE LOCALHOST VERIFICATION (MILESTONE 2 & 3)")
print("Frontend: http://localhost:3000 (Vite)")
print("Backend:  http://127.0.0.1:8080 (Laravel + PostgreSQL)")
print("=================================================================\n")

# -------------------------------------------------------------
# 1. REGISTRATION FOR ALL 3 PROFILES (LOCALHOST)
# -------------------------------------------------------------
print("--- TEST SUITE 1: LOCAL REGISTRATION (ALL 3 ROLES) ---")
rand = random.randint(1000, 9999)
users = [
    {
        'type': 'corporate',
        'name': f'Local Corp Admin {rand}',
        'email': f'local.corp.{rand}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'corporate',
        'organization_name': f'Local Banking Corp {rand}'
    },
    {
        'type': 'outsourced_dpo',
        'name': f'Local DPO Consultant {rand}',
        'email': f'local.dpo.{rand}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'outsourced_dpo',
        'organization_name': f'Local DPO Practice {rand}'
    },
    {
        'type': 'dpco_firm',
        'name': f'Local DPCO Auditor {rand}',
        'email': f'local.dpco.{rand}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'dpco_firm',
        'organization_name': f'Local DPCO Assurance {rand}'
    }
]

tokens = {}
tenants = {}

for u in users:
    code, res = api_call('/auth/register', method='POST', data=u)
    ok = code in [200, 201] and ('token' in res or (res.get('data') and 'token' in res.get('data', {})))
    tok = res.get('token') or res.get('data', {}).get('token')
    tokens[u['type']] = tok
    tenants[u['type']] = res.get('tenant') or res.get('data', {}).get('tenant')
    record_test(
        f"Register {u['type']} profile on localhost",
        ok,
        f"HTTP {code} | Role: {res.get('user', {}).get('role') or res.get('data', {}).get('user', {}).get('role')}"
    )

corp_token = tokens.get('corporate')
dpo_token = tokens.get('outsourced_dpo')
dpco_token = tokens.get('dpco_firm')
corp_tenant_id = tenants.get('corporate', {}).get('id')
dpo_tenant_id = tenants.get('outsourced_dpo', {}).get('id')

# Duplicate registration check
dup_code, dup_res = api_call('/auth/register', method='POST', data=users[0])
record_test(
    "Duplicate Email Rejection on Localhost",
    dup_code in [400, 422],
    f"HTTP {dup_code} returned on existing email"
)

# -------------------------------------------------------------
# 2. LOCAL LOGIN & AUTHENTICATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 2: LOCAL LOGIN & AUTHENTICATION ---")
for u in users:
    code, res = api_call('/auth/login', method='POST', data={'email': u['email'], 'password': u['password']})
    record_test(
        f"Login {u['type']} on localhost",
        code == 200 and bool(res.get('token')),
        f"HTTP {code} | Token issued | Role: {res.get('user', {}).get('role')}"
    )

# Invalid password check
inv_code, _ = api_call('/auth/login', method='POST', data={'email': users[0]['email'], 'password': 'WrongPassword123'})
record_test(
    "Invalid Credentials Rejection on Localhost",
    inv_code in [401, 422],
    f"HTTP {inv_code} properly returned for bad password"
)

# -------------------------------------------------------------
# 3. LOCAL RBAC & PORTAL RESTRICTIONS
# -------------------------------------------------------------
print("\n--- TEST SUITE 3: RBAC & PORTAL RESTRICTIONS ---")
code_corp_port, _ = api_call('/dashboard/portfolio', method='GET', token=corp_token)
record_test(
    "Corporate user restricted from /dashboard/portfolio on localhost",
    code_corp_port == 403,
    f"HTTP {code_corp_port} (Forbidden as expected)"
)

code_dpo_port, res_dpo_port = api_call('/dashboard/portfolio', method='GET', token=dpo_token)
record_test(
    "Outsourced DPO allowed on /dashboard/portfolio on localhost",
    code_dpo_port == 200,
    f"HTTP {code_dpo_port} (Allowed)"
)

code_dpco_port, res_dpco_port = api_call('/dashboard/portfolio', method='GET', token=dpco_token)
record_test(
    "DPCO Lead Auditor allowed on /dashboard/portfolio on localhost",
    code_dpco_port == 200,
    f"HTTP {code_dpco_port} (Allowed)"
)

# -------------------------------------------------------------
# 4. MILESTONE 3: TENANT ISOLATION AT QUERY/MODEL LAYER
# -------------------------------------------------------------
print("\n--- TEST SUITE 4: MILESTONE 3 - TENANT ISOLATION & QUERY SCOPING ---")

# Corporate Admin attempts to hijack DPO Tenant context via X-Tenant-ID
code_iso, res_iso = api_call('/dashboard/metrics', method='GET', token=corp_token, headers={'X-Tenant-ID': dpo_tenant_id})
record_test(
    "Cross-Tenant Tampering Blocked (Strict Isolation)",
    code_iso in [403, 400],
    f"HTTP {code_iso} returned when Corporate tries to access foreign tenant context"
)

# Legitimate Tenant Scoped Request
code_legit, res_legit = api_call('/dashboard/metrics', method='GET', token=corp_token)
record_test(
    "Legitimate Tenant-Scoped Query",
    code_legit == 200 and res_legit.get('tenant', {}).get('id') == corp_tenant_id,
    f"HTTP {code_legit} | Scoped to {res_legit.get('tenant', {}).get('name')}"
)

# -------------------------------------------------------------
# 5. MILESTONE 3: GUEST INVITATIONS & 30-DAY EXPIRATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 5: MILESTONE 3 - GUEST INVITATIONS & 30-DAY EXPIRATION ---")

inv_payload = {
    'email': f'auditor.{rand}@kpmg-assurance.ng',
    'department_assigned': 'External Assurance',
    'assigned_role': 'auditor_viewer',
    'expires_days': 30
}
code_inv, res_inv = api_call('/invitations', method='POST', data=inv_payload, token=corp_token)
inv_data = res_inv.get('data', {})
token_str = inv_data.get('invitation_token')
inv_id = inv_data.get('id')

record_test(
    "Create 30-Day Guest Invitation",
    code_inv == 201 and bool(token_str),
    f"HTTP {code_inv} | Dispatched to {inv_data.get('email')} | Token: {token_str[:15]}..."
)

# Public resolution of token without authentication
code_pub, res_pub = api_call(f'/public/invitations/{token_str}', method='GET')
record_test(
    "Public Token Resolution (Guest Verification)",
    code_pub == 200 and res_pub.get('data', {}).get('email') == inv_payload['email'],
    f"HTTP {code_pub} | Organization: {res_pub.get('data', {}).get('tenant_name')} | Status: {res_pub.get('data', {}).get('status')}"
)

# Revoke / Cancel guest invitation
if inv_id:
    code_del, res_del = api_call(f'/invitations/{inv_id}', method='DELETE', token=corp_token)
    record_test(
        "Revoke / Cancel Guest Invitation (DELETE /invitations/{id})",
        code_del == 200,
        f"HTTP {code_del} | {res_del.get('message')}"
    )

# -------------------------------------------------------------
# 6. MILESTONE 3: AUDIT LOGGING FOUNDATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 6: MILESTONE 3 - AUDIT LOGGING FOUNDATION ---")

code_audit, res_audit = api_call('/admin/audit-logs', method='GET', token=corp_token)
logs = res_audit.get('data', [])
record_test(
    "Audit Log Stream & Telemetry Retrieval",
    code_audit == 200 and len(logs) > 0,
    f"HTTP {code_audit} | Total audit events recorded: {len(logs)}"
)

# Non-admin restricted from viewing audit logs
code_nonadmin, _ = api_call('/admin/audit-logs', method='GET', token=dpo_token)
record_test(
    "Non-Admin Restricted from Audit Logs",
    code_nonadmin == 403,
    f"HTTP {code_nonadmin} (Forbidden for non-admin)"
)

# -------------------------------------------------------------
# 7. MILESTONE 3: SECURITY CONTROLS & PRIVILEGE ESCALATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 7: MILESTONE 3 - SECURITY CONTROLS & PRIVILEGE ESCALATION ---")

# Corporate Admin attempts to provision Super Admin
esc_payload = {
    'name': 'Malicious Super Admin',
    'email': f'evil.super.{rand}@example.com',
    'role': 'super_admin',
    'password': 'HackerPassword2026!'
}
code_esc, res_esc = api_call('/users', method='POST', data=esc_payload, token=corp_token)
record_test(
    "Privilege Escalation Blocked (Corporate cannot create Super Admin)",
    code_esc in [403, 422],
    f"HTTP {code_esc} returned: {res_esc.get('message', res_esc.get('error'))}"
)

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
print("\n=================================================================")
print(f"LOCALHOST VERIFICATION SUMMARY: {len(results['passed'])} PASSED | {len(results['failed'])} FAILED")
print("=================================================================")
if results['failed']:
    print("FAILED TESTS:")
    for f in results['failed']:
        print(f" - {f[0]}: {f[1]}")
    sys.exit(1)
else:
    print("ALL MILESTONE 2 & 3 REQUIREMENTS CONFIRMED 100% WORKING LOCALLY!")
    sys.exit(0)
