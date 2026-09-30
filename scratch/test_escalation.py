import urllib.request
import json
import random

# Login as corporate admin
login_data = json.dumps({'email': 'corp.user.6820@example.com', 'password': 'SecurePassword2026!'}).encode('utf-8')
req = urllib.request.Request('https://truepriv-saas.vercel.app/api/v1/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    token = res['token']

# Attempt to create a super_admin user as corporate_admin
unique_email = f"hacker.{random.randint(1000, 9999)}@example.com"
user_data = json.dumps({
    'name': 'Hacker Admin',
    'email': unique_email,
    'role': 'super_admin'
}).encode('utf-8')

create_req = urllib.request.Request('https://truepriv-saas.vercel.app/api/v1/users', data=user_data, headers={
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
})

try:
    with urllib.request.urlopen(create_req) as resp:
        print("VULNERABILITY DETECTED! Created super_admin:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"SECURITY GUARD SUCCESS! HTTP Status: {e.code}")
    print("Response:", e.read().decode('utf-8'))
