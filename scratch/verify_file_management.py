import json
import urllib.request
import urllib.parse
from http.cookiejar import CookieJar
import time

BASE_URL = "http://127.0.0.1:5000/api/v1"

def make_request(opener, url, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with opener.open(req) as res:
            status = res.status
            content_type = res.headers.get("Content-Type", "")
            body = res.read()
            if "application/json" in content_type:
                return status, json.loads(body.decode("utf-8")) if body else {}
            return status, body
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return e.code, json.loads(body.decode("utf-8")) if body else {}
        except Exception:
            return e.code, {"error": body.decode("utf-8", errors='ignore')}

def make_multipart_request(opener, url, filename, file_content, field_name='file'):
    boundary = '----WebKitFormBoundaryFileManagementVerification2026'
    parts = [
        f'--{boundary}',
        f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"',
        'Content-Type: application/octet-stream',
        '',
        file_content,
        f'--{boundary}--',
        ''
    ]
    body = '\r\n'.join(parts).encode('utf-8')
    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body))
    }
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
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
    # Set up HTTP openers
    cj_admin = CookieJar()
    opener_admin = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_admin))
    
    cj_cust1 = CookieJar()
    opener_cust1 = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_cust1))
    
    cj_cust2 = CookieJar()
    opener_cust2 = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_cust2))

    # 1. Login Admin
    print("\n--- 1. Login Admin & Fetch Initial Metrics ---")
    status, body = make_request(opener_admin, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    })
    assert status == 200, "Admin login failed"
    
    status, admin_dash = make_request(opener_admin, f"{BASE_URL}/dashboard/admin")
    assert status == 200
    initial_deleted = admin_dash.get("deleted_files", 0)
    print(f"Initial deleted files on Admin Dashboard: {initial_deleted}")

    # 2. Login Customer 1
    print("\n--- 2. Login Customer 1 (John Doe) & Fetch Initial Metrics ---")
    status, body = make_request(opener_cust1, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "john.doe@gmail.com",
        "password": "JohnDoe2026!"
    })
    assert status == 200, "Customer 1 login failed"
    
    status, customer_dash = make_request(opener_cust1, f"{BASE_URL}/dashboard/customer")
    assert status == 200
    initial_active = customer_dash.get("active_files", 0)
    print(f"Initial active files on Customer Dashboard: {initial_active}")

    # 3. Upload a file as Customer 1
    print("\n--- 3. Uploading file as Customer 1 ---")
    file_content = "DUMMY FILE FOR ADVANCED FILE MANAGEMENT MODULE TESTING"
    status, body = make_multipart_request(opener_cust1, f"{BASE_URL}/files/upload", "manage_test.png", file_content)
    assert status == 201, f"Failed to upload file: {body}"
    file_id = body["id"]
    print(f"Uploaded file successfully! File ID: {file_id}")

    # 4. Check active files count increased
    print("\n--- 4. Checking Customer Dashboard metrics ---")
    status, customer_dash = make_request(opener_cust1, f"{BASE_URL}/dashboard/customer")
    assert status == 200
    new_active = customer_dash.get("active_files", 0)
    print(f"New active files on Customer Dashboard: {new_active}")
    assert new_active == initial_active + 1, "Expected active files count to increase by 1"

    # 5. Download own file as Customer 1
    print("\n--- 5. Downloading own file as Customer 1 ---")
    status, body = make_request(opener_cust1, f"{BASE_URL}/files/{file_id}/download")
    assert status == 200, f"Failed to download own file: {body}"
    assert body.decode("utf-8") == file_content, "Downloaded file content does not match uploaded content"
    print("Download own file passed!")

    # 6. Download file as Admin
    print("\n--- 6. Downloading Customer 1's file as Admin ---")
    status, body = make_request(opener_admin, f"{BASE_URL}/files/{file_id}/download")
    assert status == 200, f"Failed to download file as Admin: {body}"
    assert body.decode("utf-8") == file_content
    print("Admin download check passed!")

    # 7. Register/login Customer 2 and try accessing Customer 1's file
    print("\n--- 7. Register & Login Customer 2 (Jane Miller) ---")
    status, body = make_request(opener_cust2, f"{BASE_URL}/auth/register", method="POST", data={
        "name": "Jane Miller",
        "email": "jane.miller@gmail.com",
        "password": "JaneMiller2026!",
        "phone": "+1987654321",
        "city": "Austin",
        "state": "Texas"
    })
    # Ignore if already registered
    status, body = make_request(opener_cust2, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "jane.miller@gmail.com",
        "password": "JaneMiller2026!"
    })
    assert status == 200, "Customer 2 login failed"

    print("\n--- 8. Attempting to download Customer 1's file as Customer 2 (should fail) ---")
    status, body = make_request(opener_cust2, f"{BASE_URL}/files/{file_id}/download")
    print("Customer 2 download status:", status, body)
    assert status == 403, "Expected 403 Forbidden for non-owner customer"

    print("\n--- 9. Attempting to delete Customer 1's file as Customer 2 (should fail) ---")
    status, body = make_request(opener_cust2, f"{BASE_URL}/files/{file_id}", method="DELETE")
    print("Customer 2 delete status:", status, body)
    assert status == 403, "Expected 403 Forbidden for non-owner customer delete"

    # 10. Test Search Integration with date parameters
    print("\n--- 10. Testing Date Filter Search Integration ---")
    current_date = time.strftime("%Y-%m-%d")
    # Query with uploaded_after == today
    status, search_res = make_request(opener_cust1, f"{BASE_URL}/files?uploaded_after={current_date}")
    assert status == 200
    assert any(f["id"] == file_id for f in search_res["items"]), "Expected uploaded file to be in search results"

    # Query with uploaded_before == yesterday (should not find the file uploaded today)
    import datetime
    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    status, search_res = make_request(opener_cust1, f"{BASE_URL}/files?uploaded_before={yesterday}")
    assert status == 200
    assert not any(f["id"] == file_id for f in search_res["items"]), "Did not expect file in yesterday search results"
    print("Search integration checks passed!")

    # 11. Customer 1 deletes their own file
    print("\n--- 11. Deleting own file as Customer 1 ---")
    status, body = make_request(opener_cust1, f"{BASE_URL}/files/{file_id}", method="DELETE")
    print("Customer 1 delete status:", status, body)
    assert status == 200
    assert body["message"] == "File deleted successfully"

    # 12. Try downloading deleted file (should fail with 404)
    print("\n--- 12. Trying to download deleted file (should fail 404) ---")
    status, body = make_request(opener_cust1, f"{BASE_URL}/files/{file_id}/download")
    print("Download deleted file status:", status, body)
    assert status == 404, "Expected 404 Not Found for soft-deleted file"

    # 13. Verify dashboard counters updated
    print("\n--- 13. Verifying updated dashboard counters ---")
    status, customer_dash = make_request(opener_cust1, f"{BASE_URL}/dashboard/customer")
    assert status == 200
    print("New Customer Dashboard active files:", customer_dash.get("active_files"))
    assert customer_dash.get("active_files") == initial_active, "Expected active files to go back down after delete"

    status, admin_dash = make_request(opener_admin, f"{BASE_URL}/dashboard/admin")
    assert status == 200
    print("New Admin Dashboard deleted files:", admin_dash.get("deleted_files"))
    assert admin_dash.get("deleted_files") == initial_deleted + 1, "Expected deleted files count to go up by 1"

    # 14. Customer attempts to restore file (should fail with 403)
    print("\n--- 14. Customer attempting to restore file (should fail 403) ---")
    status, body = make_request(opener_cust1, f"{BASE_URL}/files/{file_id}/restore", method="PUT")
    print("Customer restore status:", status, body)
    assert status == 403, "Expected 403 Forbidden for customer trying to restore"

    # 15. Admin restores the file
    print("\n--- 15. Admin restoring the file ---")
    status, body = make_request(opener_admin, f"{BASE_URL}/files/{file_id}/restore", method="PUT")
    print("Admin restore status:", status, body)
    assert status == 200
    assert body["message"] == "File restored successfully"

    # 16. Verify restored file is accessible again
    print("\n--- 16. Verifying restored file is download-accessible again ---")
    status, body = make_request(opener_cust1, f"{BASE_URL}/files/{file_id}/download")
    assert status == 200, "Expected 200 OK for restored file download"
    assert body.decode("utf-8") == file_content
    print("Restore verification passed!")

    # 17. Verify Audit Logs generated
    print("\n--- 17. Checking audit logs for download, delete, and restore logs ---")
    logs_to_check = ["File Downloaded", "File Deleted", "File Restored"]
    for action in logs_to_check:
        action_encoded = urllib.parse.quote(action)
        status, body = make_request(opener_admin, f"{BASE_URL}/audit-logs?action={action_encoded}")
        assert status == 200
        assert len(body["items"]) > 0, f"Expected audit log entry for '{action}', none found"
        latest_log = body["items"][0]
        print(f"Verified log: action='{latest_log['action']}', details='{latest_log['details']}'")
    print("Audit log verification passed!")

    # 18. Logouts
    print("\n--- 18. Logging out users ---")
    make_request(opener_cust1, f"{BASE_URL}/auth/logout", method="POST")
    make_request(opener_cust2, f"{BASE_URL}/auth/logout", method="POST")
    make_request(opener_admin, f"{BASE_URL}/auth/logout", method="POST")

    print("\nAll Advanced File Management integration tests passed successfully!")

if __name__ == "__main__":
    run_tests()
