import urllib.request
import urllib.error
import json
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
print("STARTING MILESTONE 3 VERIFICATION")
print("Multi-Tenancy, Security Controls, Guest Expiry & Audit Logging")
print("=================================================================\n")

# 1. Login as Corporate Admin (First Capital Bank PLC)
code, corp_login = api_call('/auth/login', method='POST', data={
    'email': 'corp.user.6820@example.com',
    'password': 'SecurePassword2026!'
})
corp_token = corp_login.get('token')
corp_tenant_id = corp_login.get('tenant', {}).get('id')
print(f"Logged in as Corporate Admin: {corp_login.get('user', {}).get('email')} (Tenant: {corp_tenant_id})")

# 2. Login as Outsourced DPO (Pan-African Privacy Advisory)
code, dpo_login = api_call('/auth/login', method='POST', data={
    'email': 'dpo.user.9344@example.com',
    'password': 'SecurePassword2026!'
})
dpo_token = dpo_login.get('token')
dpo_tenant_id = dpo_login.get('tenant', {}).get('id')
print(f"Logged in as Outsourced DPO: {dpo_login.get('user', {}).get('email')} (Tenant: {dpo_tenant_id})\n")

# -------------------------------------------------------------
# SUITE 1: TENANT ISOLATION & SCOPING
# -------------------------------------------------------------
print("--- TEST SUITE 1: TENANT ISOLATION & QUERY SCOPING ---")

# Corporate Admin attempts to hijack DPO Tenant context via X-Tenant-ID
code_iso, res_iso = api_call('/dashboard/metrics', method='GET', token=corp_token, headers={'X-Tenant-ID': dpo_tenant_id})
record_test(
    "Cross-Tenant Data Tampering / Hijack Blocked",
    code_iso in [403, 400],
    f"HTTP {code_iso} returned when Corporate attempts access to foreign tenant"
)

# Legitimate Tenant Scoped Request
code_legit, res_legit = api_call('/dashboard/metrics', method='GET', token=corp_token)
record_test(
    "Legitimate Tenant-Scoped Query",
    code_legit == 200 and res_legit.get('tenant', {}).get('id') == corp_tenant_id,
    f"HTTP {code_legit} | Scoped to {res_legit.get('tenant', {}).get('name')}"
)

# -------------------------------------------------------------
# SUITE 2: GUEST INVITATIONS & 30-DAY EXPIRATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 2: GUEST INVITATIONS & 30-DAY EXPIRATION ---")

# Create a Guest Invitation with 30-day validity
inv_payload = {
    'email': 'external.auditor@kpmg-assurance.ng',
    'department_assigned': 'External Assurance',
    'assigned_role': 'auditor_viewer',
    'expires_days': 30
}
code_inv, res_inv = api_call('/invitations', method='POST', data=inv_payload, token=corp_token)
inv_data = res_inv.get('data', {})
token_str = inv_data.get('invitation_token')
inv_id = inv_data.get('id')
record_test(
    "Create 30-Day Guest Auditor Invitation",
    code_inv == 201 and bool(token_str),
    f"HTTP {code_inv} | Dispatched to {inv_data.get('email')} | Token issued"
)

# Public resolution of the invitation token (no auth required)
code_pub, res_pub = api_call(f'/public/invitations/{token_str}', method='GET')
record_test(
    "Public Token Resolution (Guest Verification)",
    code_pub == 200 and res_pub.get('data', {}).get('email') == 'external.auditor@kpmg-assurance.ng',
    f"HTTP {code_pub} | Organization: {res_pub.get('data', {}).get('tenant_name')} | Status: {res_pub.get('data', {}).get('status')}"
)

# Verification of Invalid / Expired Token Rejection
code_bad_tok, res_bad_tok = api_call('/public/invitations/invalid-fake-token-999', method='GET')
record_test(
    "Invalid Guest Token Rejection",
    code_bad_tok in [404, 410],
    f"HTTP {code_bad_tok} properly returned for bogus token"
)

# Revoke the invitation
if inv_id:
    code_del, res_del = api_call(f'/invitations/{inv_id}', method='DELETE', token=corp_token)
    record_test(
        "Revoke / Cancel Guest Invitation",
        code_del == 200,
        f"HTTP {code_del} | Revocation confirmed"
    )

# -------------------------------------------------------------
# SUITE 3: AUDIT LOGGING FOUNDATION
# -------------------------------------------------------------
print("\n--- TEST SUITE 3: AUDIT LOGGING FOUNDATION ---")

code_audit, res_audit = api_call('/admin/audit-logs', method='GET', token=corp_token)
logs = res_audit.get('data', [])
record_test(
    "Audit Log Stream & Telemetry Retrieval",
    code_audit == 200 and len(logs) > 0,
    f"HTTP {code_audit} | Total audit events recorded: {len(logs)}"
)

# Verify that non-admin is blocked from reading audit logs
code_nonadmin_audit, res_nonadmin_audit = api_call('/admin/audit-logs', method='GET', token=dpo_token)
record_test(
    "Non-Admin Restricted from System Audit Logs",
    code_nonadmin_audit == 403,
    f"HTTP {code_nonadmin_audit} (Forbidden as expected for non-admin)"
)

# -------------------------------------------------------------
# SUITE 4: SECURITY CONTROLS & PRIVILEGE ESCALATION BLOCK
# -------------------------------------------------------------
print("\n--- TEST SUITE 4: SECURITY CONTROLS & PRIVILEGE ESCALATION ---")

# Privilege Escalation: Corporate Admin tries to provision a Super Admin
escalation_payload = {
    'name': 'Malicious Super Admin',
    'email': 'evil.superadmin@example.com',
    'role': 'super_admin',
    'password': 'HackerPassword2026!'
}
code_esc, res_esc = api_call('/users', method='POST', data=escalation_payload, token=corp_token)
record_test(
    "Privilege Escalation Blocked (Corporate cannot create Super Admin)",
    code_esc in [403, 422],
    f"HTTP {code_esc} returned: {res_esc.get('message', res_esc.get('error'))}"
)

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
print("\n=================================================================")
print(f"MILESTONE 3 SUMMARY: {len(results['passed'])} PASSED | {len(results['failed'])} FAILED")
print("=================================================================")
if results['failed']:
    sys.exit(1)
else:
    print("ALL MILESTONE 3 SECURITY & MULTI-TENANCY CONTROLS CONFIRMED!")
    sys.exit(0)
