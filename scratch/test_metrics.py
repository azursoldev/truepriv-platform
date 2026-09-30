import urllib.request
import json

# Login as corporate
login_data = json.dumps({'email': 'corp.user.6820@example.com', 'password': 'SecurePassword2026!'}).encode('utf-8')
req = urllib.request.Request('https://truepriv-saas.vercel.app/api/v1/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    token = res['token']

# Call dashboard metrics
metrics_req = urllib.request.Request('https://truepriv-saas.vercel.app/api/v1/dashboard/metrics', headers={
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json'
})
with urllib.request.urlopen(metrics_req) as resp:
    m = json.loads(resp.read().decode('utf-8'))
    print("LIVE DASHBOARD API DATA:")
    print("Success:", m.get('success'))
    print("Compliance Score:", m.get('compliance_score'))
    print("Key Metrics:", list(m.keys()))
