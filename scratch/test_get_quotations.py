import requests

BASE_URL = "http://127.0.0.1:5001/api/v1"

def test_get_quotations():
    session = requests.Session()
    
    # 1. Login Admin
    print("Logging in as admin...")
    login_payload = {
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    }
    r = session.post(f"{BASE_URL}/auth/login", json=login_payload)
    print("Login status:", r.status_code)
    
    # 2. Get Quotations
    print("Requesting GET /quotations?per_page=100...")
    r = session.get(f"{BASE_URL}/quotations", params={"per_page": 100})
    print("Response status:", r.status_code)
    try:
        print("Response JSON:", r.json())
    except Exception as e:
        print("Response text:", r.text)

if __name__ == "__main__":
    test_get_quotations()
