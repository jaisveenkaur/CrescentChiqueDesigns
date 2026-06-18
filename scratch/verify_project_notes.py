import json
import urllib.request
import urllib.parse
from http.cookiejar import CookieJar

BASE_URL = "http://127.0.0.1:5001/api/v1"

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
    # Set up HTTP opener with cookie support
    cj = CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    print("\n--- 1. Logging in as Admin ---")
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    })
    print("Admin login status:", status)
    assert status == 200, "Admin login failed"

    print("\n--- 2. Fetching project list to get a project ID ---")
    status, body = make_request(opener, f"{BASE_URL}/projects")
    print("Fetch projects status:", status)
    assert status == 200, "Failed to fetch projects"
    assert len(body["items"]) > 0, "No projects found in database"
    
    project = body["items"][0]
    project_id = project["id"]
    customer_id = project["customer_id"]
    print(f"Selected project ID for test: {project_id}")

    print("\n--- 3. Posting a valid project note as Admin ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/notes", method="POST", data={
        "note": "Kitchen layout finalized by design team"
    })
    print("Post note status:", status, body)
    assert status == 201, "Failed to create project note"
    assert body["message"] == "Project note added successfully"
    note_id = body["note"]["id"]

    print("\n--- 4. Retrieving project notes as Admin ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/notes")
    print("Get notes status:", status, "Count:", len(body))
    assert status == 200
    assert len(body) > 0
    assert any(n["note"] == "Kitchen layout finalized by design team" for n in body)
    print("Admin notes retrieval verified!")

    print("\n--- 5. Testing validation bounds on project notes ---")
    invalid_cases = [
        {"note": ""},                             # Empty note
        {"note": "   "},                          # Whitespace only
        {"note": "a" * 2001},                     # Length > 2000
        {}                                        # Missing field
    ]
    for case in invalid_cases:
        status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/notes", method="POST", data=case)
        print(f"Post with {len(case.get('note', '')) if 'note' in case else 'missing'} chars note status:", status, body)
        assert status == 400, f"Expected 400 Bad Request, got {status}"
    print("Validation checks passed!")

    print("\n--- 6. Logging out Admin ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\n--- 7. Logging in as Project Owner Customer (John Doe) ---")
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "john.doe@gmail.com",
        "password": "JohnDoe2026!"
    })
    print("Customer 1 login status:", status)
    assert status == 200

    print("\n--- 8. Attempting to add note as Customer (should fail) ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/notes", method="POST", data={
        "note": "Customer trying to add note"
    })
    print("Customer POST note status:", status)
    assert status == 403, f"Expected 403, got {status}"

    print("\n--- 9. Retrieving own project notes as Customer ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/notes")
    print("Customer GET notes status:", status, "Count:", len(body))
    assert status == 200
    assert any(n["note"] == "Kitchen layout finalized by design team" for n in body)
    print("Customer ownership check passed!")

    print("\n--- 10. Registering and logging in Customer 2 (Jane Miller) ---")
    # First logout customer 1
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    # Register Customer 2
    status, body = make_request(opener, f"{BASE_URL}/auth/register", method="POST", data={
        "name": "Jane Miller",
        "email": "jane.miller@gmail.com",
        "password": "JaneMiller2026!",
        "phone": "+1987654321",
        "city": "Austin",
        "state": "Texas"
    })
    print("Register Customer 2 status:", status)
    assert status in (201, 409), "Registration failed"  # 409 if already registered from other tests
    
    # Login Customer 2
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "jane.miller@gmail.com",
        "password": "JaneMiller2026!"
    })
    print("Customer 2 login status:", status)
    assert status == 200

    print("\n--- 11. Attempting to retrieve Customer 1's project notes as Customer 2 (should fail) ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/notes")
    print("Customer 2 GET notes status:", status, body)
    assert status == 403, f"Expected 403 Forbidden, got {status}"
    print("Customer isolation verification passed!")

    print("\n--- 12. Logging out Customer 2 ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\n--- 13. Logging in as Admin to verify Audit Logs ---")
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    })
    print("Admin login status:", status)
    assert status == 200

    print("\n--- 14. Checking audit logs for Note Added log ---")
    action_added_encoded = urllib.parse.quote("Project Note Added")
    status, body = make_request(opener, f"{BASE_URL}/audit-logs?action={action_added_encoded}")
    assert status == 200
    assert len(body["items"]) > 0
    print(f"Found log: {body['items'][0]['action']} - {body['items'][0]['details']}")

    print("\n--- 15. Checking audit logs for Notes Viewed log ---")
    action_viewed_encoded = urllib.parse.quote("Project Notes Viewed")
    status, body = make_request(opener, f"{BASE_URL}/audit-logs?action={action_viewed_encoded}")
    assert status == 200
    assert len(body["items"]) > 0
    print(f"Found log: {body['items'][0]['action']} - {body['items'][0]['details']}")

    print("\n--- 16. Logging out Admin ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\nAll Project Notes integration tests passed successfully!")

if __name__ == "__main__":
    run_tests()
