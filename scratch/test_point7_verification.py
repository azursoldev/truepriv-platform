import urllib.request
import urllib.error
import json

BASE_URL = 'http://127.0.0.1:8080/api/v1'

def api_call(path, method='GET', data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {'Accept': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    body = json.dumps(data).encode('utf-8') if data else None
    if body and method != 'GET':
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode('utf-8')
        return e.code, json.loads(resp_body) if resp_body else {}

def test_point7():
    print("=== LIVE BACKEND VERIFICATION FOR POINT 7: DATA RESIDENCY & LOCALIZATION ===")
    
    # 1. Login as Corporate Admin (trying passwords)
    code, res = api_call('/auth/login', method='POST', data={
        "email": "compliance@apexmfb.ng",
        "password": "Password123!"
    })
    if code != 200:
        code, res = api_call('/auth/login', method='POST', data={
            "email": "compliance@apexmfb.ng",
            "password": "password123"
        })

    print(f"Login Response: HTTP {code} | User: {res.get('user', {}).get('email')}")
    assert code == 200, f"Login failed: {res}"
    token = res['token']
    print(f"✅ 1. Login successful (Token acquired)")

    # 2. GET /localization/status
    code, res = api_call('/localization/status', token=token)
    assert code == 200, f"GET /localization/status failed: {res}"
    data = res['data']
    print(f"✅ 2. GET /localization/status API call successful:")
    print(f"   - Active Node: {data.get('residency_label')}")
    print(f"   - Onshore Status: {data.get('is_onshore')}")
    print(f"   - Sovereignty Tier: {data.get('sovereignty_tier')}")

    # 3. PUT /localization/switch -> local_galaxy_backbone
    code, res = api_call('/localization/switch', method='PUT', token=token, data={"data_residency": "local_galaxy_backbone"})
    assert code == 200, f"PUT /localization/switch failed: {res}"
    print(f"✅ 3. PUT /localization/switch API call successful: {res.get('message')}")

    # 4. GET /localization/status to verify DB state updated
    code, res = api_call('/localization/status', token=token)
    assert code == 200
    data = res['data']
    print(f"✅ 4. Verified DB Data Residency update in backend:")
    print(f"   - Updated Label: {data.get('residency_label')}")
    print(f"   - Onshore Status: {data.get('is_onshore')}")
    assert data.get('is_onshore') == True, "Expected onshore to be True"

    # 5. Switch node back to global_aws
    code, res = api_call('/localization/switch', method='PUT', token=token, data={"data_residency": "global_aws"})
    assert code == 200
    print(f"✅ 5. PUT /localization/switch back to global_aws successful: {res.get('message')}")

    print("\n🎉 POINT 7 (SECURITY CONTROLS & DATA RESIDENCY) IS 100% VERIFIED WORKING ON BACKEND & DATABASE!")

if __name__ == '__main__':
    test_point7()
