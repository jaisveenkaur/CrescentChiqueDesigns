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
    print(f"Selected project ID for test: {project_id} (Current status: {project['project_status']}, current progress: {project['progress_percentage']})")

    # Initial dashboards check before updating
    print("\n--- 3. Checking initial dashboards state ---")
    status, admin_dash = make_request(opener, f"{BASE_URL}/dashboard/admin")
    assert status == 200, "Failed to load admin dashboard"
    initial_avg = admin_dash.get("average_project_progress")
    print(f"Initial average project progress: {initial_avg}")

    print("\n--- 4. Logging out Admin to test authorization ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\n--- 5. Logging in as Customer ---")
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "john.doe@gmail.com",
        "password": "JohnDoe2026!"
    })
    print("Customer login status:", status)
    assert status == 200, "Customer login failed"

    print("\n--- 6. Attempting to update project progress as Customer (should fail) ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/progress", method="PUT", data={
        "progress_percentage": 75
    })
    print("Customer PUT status:", status)
    assert status == 403, f"Expected 403 Forbidden for customer, got {status} (response: {body})"
    print("Authorization check passed!")

    print("\n--- 7. Logging out Customer ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\n--- 8. Logging back in as Admin ---")
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    })
    print("Admin login status:", status)
    assert status == 200, "Admin login failed"

    print("\n--- 9. Testing invalid progress percentage updates (should fail) ---")
    invalid_cases = [
        {"progress_percentage": -1},       # Negative number
        {"progress_percentage": 101},      # Greater than 100
        {"progress_percentage": 75.5},     # Float value
        {"progress_percentage": "seventy"},# Non-numeric string
        {}                                 # Missing field
    ]
    for case in invalid_cases:
        status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/progress", method="PUT", data=case)
        print(f"Update with {case} status:", status, body)
        assert status == 400, f"Expected 400 Bad Request for {case}, got {status} (response: {body})"
    print("Invalid update validation checks passed!")

    print("\n--- 10. Updating project progress to 75% as Admin ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}/progress", method="PUT", data={
        "progress_percentage": 75
    })
    print("Admin PUT status:", status, body)
    assert status == 200, f"Failed to update progress to 75%: {body}"
    assert body["message"] == "Progress updated successfully"

    print("\n--- 11. Verifying progress was updated correctly via GET details ---")
    status, body = make_request(opener, f"{BASE_URL}/projects/{project_id}")
    print("GET details status:", status, "progress_percentage:", body.get("progress_percentage"))
    assert status == 200
    assert body["progress_percentage"] == 75, f"Expected progress_percentage to be 75, got {body.get('progress_percentage')}"
    assert isinstance(body["progress_percentage"], int), f"Expected progress_percentage to be int type, got {type(body.get('progress_percentage'))}"

    print("\n--- 12. Checking Admin Dashboard for average progress ---")
    status, admin_dash = make_request(opener, f"{BASE_URL}/dashboard/admin")
    assert status == 200
    avg = admin_dash.get("average_project_progress")
    print(f"New average project progress: {avg}")
    assert avg == 75.0 or avg == 75, f"Expected average of 75.0, got {avg}"
    print("Admin dashboard average progress verification passed!")

    print("\n--- 13. Verifying Audit Log entry is created ---")
    action_encoded = urllib.parse.quote("Project Progress Updated")
    status, body = make_request(opener, f"{BASE_URL}/audit-logs?action={action_encoded}")
    assert status == 200
    assert len(body["items"]) > 0, "No audit logs found for Project Progress Updated action"
    latest_log = body["items"][0]
    print(f"Latest audit log details: action='{latest_log['action']}', details='{latest_log['details']}'")
    assert latest_log["action"] == "Project Progress Updated"
    assert project_id in latest_log["details"]
    print("Audit log entry verified!")

    print("\n--- 14. Logging out Admin ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\n--- 15. Logging in as Customer to check customer dashboard ---")
    status, body = make_request(opener, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "john.doe@gmail.com",
        "password": "JohnDoe2026!"
    })
    print("Customer login status:", status)
    assert status == 200

    status, customer_dash = make_request(opener, f"{BASE_URL}/dashboard/customer")
    assert status == 200
    print("Customer dashboard keys:", list(customer_dash.keys()))
    assert "active_projects_detail" in customer_dash, "Customer dashboard missing active_projects_detail"
    
    details = customer_dash["active_projects_detail"]
    print("Customer active projects details:", details)
    found_project = False
    for p in details:
        if p["project_id"] == project_id:
            assert p["progress_percentage"] == 75, f"Expected progress percentage to be 75, got {p['progress_percentage']}"
            assert isinstance(p["progress_percentage"], int), "Expected progress percentage to be int"
            found_project = True
    assert found_project, "Tested project not found in customer active projects list"
    print("Customer dashboard verification passed!")

    print("\n--- 16. Logging out Customer ---")
    make_request(opener, f"{BASE_URL}/auth/logout", method="POST")
    cj.clear()

    print("\nAll Project Progress Tracking verification tests passed successfully!")

if __name__ == "__main__":
    run_tests()
