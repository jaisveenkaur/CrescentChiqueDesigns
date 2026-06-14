import json
import urllib.request
import urllib.parse
from http.cookiejar import CookieJar

BASE_URL = "http://127.0.0.1:5000/api/v1"

def make_request(opener, url, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with opener.open(req) as res:
            status = res.status
            body = res.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body) if body else {}
        except Exception:
            return e.code, {"error": body}

def run_tests():
    # Cookie jar and openers
    cj_cust1 = CookieJar()
    opener_cust1 = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_cust1))
    
    cj_cust2 = CookieJar()
    opener_cust2 = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_cust2))
    
    cj_admin = CookieJar()
    opener_admin = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_admin))

    print("--- 1. Login Customer 1 (John Doe) ---")
    status, res = make_request(opener_cust1, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "john.doe@gmail.com",
        "password": "JohnDoe2026!"
    })
    assert status == 200, f"Customer 1 login failed: {res}"
    print("John Doe logged in successfully.")

    print("\n--- 2. Register & Login Customer 2 (Jane Miller) ---")
    status, res = make_request(opener_cust2, f"{BASE_URL}/auth/register", method="POST", data={
        "name": "Jane Miller",
        "email": "jane.miller@gmail.com",
        "password": "JaneMiller2026!",
        "phone": "+919876543219",
        "city": "Mumbai",
        "state": "Maharashtra"
    })
    assert status == 201, f"Customer 2 registration failed: {res}"
    
    status, res = make_request(opener_cust2, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "jane.miller@gmail.com",
        "password": "JaneMiller2026!"
    })
    assert status == 200, f"Customer 2 login failed: {res}"
    print("Jane Miller logged in successfully.")

    print("\n--- 3. Create Events for both Customers to verify scoping ---")
    # Customer 1 triggers an appointment
    status, res = make_request(opener_cust1, f"{BASE_URL}/appointments", method="POST", data={
        "appointment_date": "2026-07-20",
        "appointment_time": "11:30",
        "requirements": "John Doe's Balcony Consultation"
    })
    assert status == 201
    
    # Customer 2 triggers an appointment
    status, res = make_request(opener_cust2, f"{BASE_URL}/appointments", method="POST", data={
        "appointment_date": "2026-07-22",
        "appointment_time": "15:00",
        "requirements": "Jane Miller's Kitchen Renovation"
    })
    assert status == 201

    print("\n--- 4. Query Timeline as Customer 1 (John Doe) ---")
    status, res = make_request(opener_cust1, f"{BASE_URL}/timeline")
    assert status == 200, f"Timeline query failed: {res}"
    assert "items" in res, f"Expected items in response, got {res}"
    assert "total_events" in res, f"Expected total_events in response, got {res}"
    
    # Assert that John Doe's events contain his description and not Jane's
    items = res["items"]
    print(f"John Doe total timeline events: {res['total_events']}")
    assert any("John Doe's Balcony Consultation" in item["description"] for item in items), "John Doe's appointment missing from his timeline"
    assert not any("Jane Miller's Kitchen Renovation" in item["description"] for item in items), "Jane Miller's appointment leaked into John Doe's timeline"
    print("Scoping check passed: John Doe can retrieve only his own timeline events.")

    print("\n--- 5. Verify Timeline sorting (Descending order) ---")
    created_at_dates = [item["created_at"] for item in items]
    is_sorted = all(created_at_dates[i] >= created_at_dates[i+1] for i in range(len(created_at_dates)-1))
    assert is_sorted, f"Timeline is not sorted descending by created_at: {created_at_dates}"
    print("Sorting order validation passed: Timeline events are chronologically descending.")

    print("\n--- 6. Login Admin and Attempt Access (Should be 403) ---")
    status, res = make_request(opener_admin, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    })
    assert status == 200, f"Admin login failed: {res}"
    
    status, res = make_request(opener_admin, f"{BASE_URL}/timeline")
    assert status == 403, f"Expected 403, got {status}: {res}"
    assert "Only registered customers can access their timeline" in res.get("error", ""), f"Unexpected error message: {res}"
    print("Admin guard verification passed: Admin access is correctly rejected with 403.")

    print("\n--- 7. Unauthenticated Access Check (Should be 401) ---")
    opener_unauth = urllib.request.build_opener()
    status, res = make_request(opener_unauth, f"{BASE_URL}/timeline")
    assert status == 401, f"Expected 401, got {status}: {res}"
    print("Unauthenticated guard verification passed: Guest access is rejected with 401.")

    # Cleanup logouts
    make_request(opener_cust1, f"{BASE_URL}/auth/logout", method="POST")
    make_request(opener_cust2, f"{BASE_URL}/auth/logout", method="POST")
    make_request(opener_admin, f"{BASE_URL}/auth/logout", method="POST")
    print("\nAll Customer Timeline integration checks passed successfully!")

if __name__ == "__main__":
    run_tests()
