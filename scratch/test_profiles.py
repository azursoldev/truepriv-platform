import urllib.request
import json
import random

base_url = 'https://truepriv-saas.vercel.app/api/v1/auth/register'

profiles = [
    {
        'type': 'corporate',
        'name': 'Corporate Admin User',
        'email': f'corp.user.{random.randint(1000, 9999)}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'corporate',
        'organization_name': 'First Capital Bank PLC'
    },
    {
        'type': 'outsourced_dpo',
        'name': 'Outsourced DPO Specialist',
        'email': f'dpo.user.{random.randint(1000, 9999)}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'outsourced_dpo',
        'organization_name': 'Pan-African Privacy Advisory'
    },
    {
        'type': 'dpco_firm',
        'name': 'DPCO Lead Auditor',
        'email': f'dpco.user.{random.randint(1000, 9999)}@example.com',
        'password': 'SecurePassword2026!',
        'tenant_type': 'dpco_firm',
        'organization_name': 'Amstel Assurance & Audit DPCO'
    }
]

for p in profiles:
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(base_url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode('utf-8'))
            print(f"SUCCESS [{p['type']}]:")
            print(f"  User: {body.get('user', {}).get('email')} | Role: {body.get('user', {}).get('role')}")
            print(f"  Tenant: {body.get('tenant', {}).get('name')} | Type: {body.get('tenant', {}).get('type')}")
            print(f"  Token Issued: {bool(body.get('token'))}")
    except Exception as e:
        print(f"ERROR [{p['type']}]: {e}")
