import requests
import json

BASE_URL = "http://127.0.0.1:5001/api/v1"

def test():
    session = requests.Session()
    login_payload = {
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    }
    r = session.post(f"{BASE_URL}/auth/login", json=login_payload)
    if r.status_code != 200:
        print("Login failed:", r.text)
        return

    r = session.get(f"{BASE_URL}/quotations", params={"per_page": 100})
    print("Status Code:", r.status_code)
    try:
        print("Response:", json.dumps(r.json(), indent=2))
    except Exception:
        print("Raw Response:", r.text)

if __name__ == "__main__":
    test()
