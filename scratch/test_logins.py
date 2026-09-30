import urllib.request
import json

base_url = 'https://truepriv-saas.vercel.app/api/v1/auth/login'

test_users = [
    ('corp.user.6820@example.com', 'SecurePassword2026!', 'corporate'),
    ('dpo.user.9344@example.com', 'SecurePassword2026!', 'outsourced_dpo'),
    ('dpco.user.8361@example.com', 'SecurePassword2026!', 'dpco_firm'),
]

for email, password, ptype in test_users:
    data = json.dumps({'email': email, 'password': password}).encode('utf-8')
    req = urllib.request.Request(base_url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode('utf-8'))
            print(f"LOGIN SUCCESS [{ptype}]:")
            print(f"  User: {body.get('user', {}).get('email')} | Role: {body.get('user', {}).get('role')}")
            print(f"  Tenant: {body.get('tenant', {}).get('name')} | Type: {body.get('tenant', {}).get('type')}")
            print(f"  Auth Token: {body.get('token')[:25]}...")
    except Exception as e:
        print(f"LOGIN ERROR [{ptype}]: {e}")
