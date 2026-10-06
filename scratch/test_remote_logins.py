import urllib.request
import urllib.error
import json

BASE_URL = "https://dpoportal.auraa-digital.com/public/api/v1"

users = [
    "admin@dpodpco.ng",
    "compliance@apexmfb.ng",
    "lead.dpo@fortressadvisory.ng",
    "lead.partner@vanguarddpco.ng",
    "dpo@apexmfb.ng",
    "auditor1@vanguarddpco.ng"
]

passwords = [
    "password123",
    "Password123!",
    "Password123",
    "admin123",
    "12345678",
    "Secret123!"
]

print("=== TESTING LIVE REMOTE LOGINS ON dpoportal.auraa-digital.com ===")

for email in users:
    found = False
    for pwd in passwords:
        data = json.dumps({"email": email, "password": pwd}).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, headers={'Content-Type': 'application/json', 'Accept': 'application/json'})
        try:
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                if res.get('token'):
                    print(f"SUCCESS: {email} | Password: '{pwd}' | Role: {res.get('user', {}).get('role')}")
                    found = True
                    break
        except urllib.error.HTTPError as e:
            pass
    if not found:
        print(f"FAILED: Could not log in {email}")
