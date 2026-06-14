import json
import urllib.request
import urllib.parse
import socket
import threading
import time
from http.cookiejar import CookieJar

BASE_URL = "http://127.0.0.1:5000/api/v1"

class SimpleSMTPServer:
    """A minimal RFC-compliant SMTP server for intercepting emails sent during tests."""
    def __init__(self, host='127.0.0.1', port=1025):
        self.host = host
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind((self.host, self.port))
        self.sock.listen(5)
        self.emails = []
        self.running = True
        self.thread = threading.Thread(target=self._listen, daemon=True)
        self.thread.start()

    def _listen(self):
        while self.running:
            try:
                conn, addr = self.sock.accept()
                threading.Thread(target=self._handle, args=(conn,), daemon=True).start()
            except Exception:
                break

    def _handle(self, conn):
        try:
            conn.sendall(b"220 SMTP Mock Server Ready\r\n")
            while True:
                data = conn.recv(4096)
                if not data:
                    break
                msg = data.decode('utf-8', errors='ignore')
                lines = msg.split('\r\n')
                for line in lines:
                    if not line:
                        continue
                    cmd = line.split()[0].upper() if line.split() else ""
                    if cmd in ("HELO", "EHLO"):
                        conn.sendall(b"250-Hello\r\n250-8BITMIME\r\n250 OK\r\n")
                    elif cmd == "MAIL":
                        conn.sendall(b"250 OK\r\n")
                    elif cmd == "RCPT":
                        conn.sendall(b"250 OK\r\n")
                    elif cmd == "DATA":
                        conn.sendall(b"354 Start mail input; end with <CRLF>.<CRLF>\r\n")
                        # Read data until CRLF.CRLF
                        body = b""
                        while b"\r\n.\r\n" not in body:
                            chunk = conn.recv(4096)
                            if not chunk:
                                break
                            body += chunk
                        self.emails.append(body.decode('utf-8', errors='ignore'))
                        conn.sendall(b"250 OK\r\n")
                    elif cmd == "QUIT":
                        conn.sendall(b"221 Bye\r\n")
                        return
                    elif cmd == "RSET":
                        conn.sendall(b"250 OK\r\n")
                    elif cmd == "NOOP":
                        conn.sendall(b"250 OK\r\n")
                    else:
                        pass
        except Exception:
            pass
        finally:
            conn.close()

    def close(self):
        self.running = False
        self.sock.close()

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
    boundary = '----WebKitFormBoundaryEmailSystemVerification2026'
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
    print("--- 0. Starting Local SMTP Mock Server ---")
    smtp_server = SimpleSMTPServer(port=1025)
    print("Mock SMTP server listening on localhost:1025")
    
    cj_cust = CookieJar()
    opener_cust = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_cust))
    
    cj_admin = CookieJar()
    opener_admin = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_admin))
    
    # Login Customer & Admin
    print("\nLog in users...")
    status, res = make_request(opener_cust, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "john.doe@gmail.com",
        "password": "JohnDoe2026!"
    })
    assert status == 200, f"Customer login failed: {res}"
    print("Customer logged in successfully.")
    
    status, res = make_request(opener_admin, f"{BASE_URL}/auth/login", method="POST", data={
        "email": "admin@crescentchique.com",
        "password": "CCAdmin2026!"
    })
    assert status == 200, f"Admin login failed: {res}"
    print("Admin logged in successfully.")
    
    # 1. Test Appointment email trigger
    print("\n--- 1. Testing Appointment Notification ---")
    smtp_server.emails.clear()
    
    status, res = make_request(opener_cust, f"{BASE_URL}/appointments", method="POST", data={
        "appointment_date": "2026-07-10",
        "appointment_time": "14:00",
        "requirements": "Complete kitchen remodeling project request"
    })
    assert status == 201, f"Expected 201, got {status}: {res}"
    print("Appointment created successfully.")
    
    # Small sleep to let the thread finish sending
    time.sleep(1)
    
    # Verify email was captured
    assert len(smtp_server.emails) == 1, f"Expected 1 email, got {len(smtp_server.emails)}"
    email_content = smtp_server.emails[0]
    assert "Consultation Appointment Confirmed" in email_content
    assert "John Doe" in email_content
    assert "2026-07-10" in email_content
    print("Appointment Confirmation email successfully captured!")
    
    # Verify Audit log in DB
    status, res = make_request(opener_admin, f"{BASE_URL}/audit-logs?action=Email+Sent")
    assert status == 200
    assert any("Appointment Confirmation" in log["details"] for log in res["items"]), "No matching audit log found"
    print("Audit Log verified for 'Email Sent' (Appointment).")

    # 2. Test File upload email trigger
    print("\n--- 2. Testing File Upload Notification ---")
    smtp_server.emails.clear()
    
    status, res = make_multipart_request(opener_cust, f"{BASE_URL}/files/upload", "test_blueprint.pdf", "DUMMY PDF BLUEPRINT DATA")
    assert status == 201, f"Expected 201, got {status}: {res}"
    print("File uploaded successfully.")
    
    time.sleep(1)
    
    assert len(smtp_server.emails) == 1, f"Expected 1 email, got {len(smtp_server.emails)}"
    email_content = smtp_server.emails[0]
    assert "File Uploaded Successfully" in email_content
    assert "test_blueprint.pdf" in email_content
    print("File Upload Confirmation email successfully captured!")
    
    status, res = make_request(opener_admin, f"{BASE_URL}/audit-logs?action=Email+Sent")
    assert status == 200
    assert any("Document Upload Success" in log["details"] for log in res["items"]), "No matching audit log found"
    print("Audit Log verified for 'Email Sent' (File Upload).")

    # 3. Test Quotation email triggers
    print("\n--- 3. Testing Quotation Notification ---")
    # Fetch design portfolio to get a valid design_id
    status, designs = make_request(opener_cust, f"{BASE_URL}/designs")
    assert status == 200 and len(designs) > 0
    design_id = designs[0]["id"]
    
    smtp_server.emails.clear()
    
    # Save Quotation (Trigger 1: New quotation generated)
    status, quotation = make_request(opener_cust, f"{BASE_URL}/quotations", method="POST", data={
        "design_id": design_id,
        "area_sqft": 500,
        "material_grade": "Premium"
    })
    assert status == 201, f"Expected 201, got {status}: {quotation}"
    quotation_id = quotation["id"]
    print("Quotation saved successfully.")
    
    time.sleep(1)
    
    assert len(smtp_server.emails) == 1, f"Expected 1 email, got {len(smtp_server.emails)}"
    assert "New Cost Quotation Generated" in smtp_server.emails[0]
    print("Quotation Generated email successfully captured!")

    # Download PDF (Trigger 2: PDF generated)
    smtp_server.emails.clear()
    status, res = make_request(opener_cust, f"{BASE_URL}/quotations/{quotation_id}/pdf")
    assert status == 200
    print("Quotation PDF generated/downloaded successfully.")
    
    time.sleep(1)
    
    assert len(smtp_server.emails) == 1, f"Expected 1 email, got {len(smtp_server.emails)}"
    assert "Quotation PDF Downloaded" in smtp_server.emails[0]
    print("PDF Generated email successfully captured!")

    status, res = make_request(opener_admin, f"{BASE_URL}/audit-logs?action=Email+Sent")
    assert status == 200
    assert any("New Cost Quotation Generated" in log["details"] for log in res["items"]), "No matching audit log found"
    assert any("Quotation PDF Downloaded" in log["details"] for log in res["items"]), "No matching audit log found"
    print("Audit Logs verified for 'Email Sent' (Quotations).")

    # 4. Test Project email trigger
    print("\n--- 4. Testing Project Status Update Notification ---")
    # Fetch customer projects to get project_id
    status, res = make_request(opener_admin, f"{BASE_URL}/projects")
    assert status == 200 and len(res["items"]) > 0
    project_id = res["items"][0]["id"]
    
    smtp_server.emails.clear()
    
    status, res = make_request(opener_admin, f"{BASE_URL}/projects/{project_id}/status", method="PUT", data={
        "project_status": "Execution",
        "progress_percentage": 60.0
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    print("Project status updated successfully by Admin.")
    
    time.sleep(1)
    
    assert len(smtp_server.emails) == 1, f"Expected 1 email, got {len(smtp_server.emails)}"
    email_content = smtp_server.emails[0]
    assert "Renovation Project Progress Update" in email_content
    assert "Execution" in email_content
    assert "60.0" in email_content
    print("Project Status Update email successfully captured!")
    
    status, res = make_request(opener_admin, f"{BASE_URL}/audit-logs?action=Email+Sent")
    assert status == 200
    assert any("Project Phase Progress Update" in log["details"] for log in res["items"]), "No matching audit log found"
    print("Audit Log verified for 'Email Sent' (Project).")

    # 5. Test Lead email trigger
    print("\n--- 5. Testing Lead Status Update Notification ---")
    # Create a lead first
    status, lead = make_request(opener_cust, f"{BASE_URL}/leads", method="POST", data={
        "name": "Sarah Connor",
        "email": "sarah.connor@gmail.com",
        "phone": "9898989898",
        "requirements": "Need premium bedroom layout with balcony"
    })
    assert status == 201, f"Expected 201, got {status}: {lead}"
    lead_id = lead["lead"]["id"]
    print("Lead inquiry created successfully.")
    
    smtp_server.emails.clear()
    
    # Update lead status
    status, res = make_request(opener_admin, f"{BASE_URL}/leads/{lead_id}/status", method="PUT", data={
        "status": "contacted"
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    print("Lead status updated successfully by Admin.")
    
    time.sleep(1)
    
    assert len(smtp_server.emails) == 1, f"Expected 1 email, got {len(smtp_server.emails)}"
    email_content = smtp_server.emails[0]
    assert "Inquiry Lead Status Update" in email_content
    assert "contacted" in email_content
    assert "Need premium bedroom layout with balcony" in email_content
    print("Lead Status Update email successfully captured!")

    status, res = make_request(opener_admin, f"{BASE_URL}/audit-logs?action=Email+Sent")
    assert status == 200
    assert any("Inquiry Update" in log["details"] for log in res["items"]), "No matching audit log found"
    print("Audit Log verified for 'Email Sent' (Lead).")

    # 6. Test Fail-Safe behavior
    print("\n--- 6. Testing Email Fail-Safe Behavior ---")
    print("Shutting down local SMTP Mock Server to force connection errors...")
    smtp_server.close()
    
    # Wait a bit for socket to release
    time.sleep(1)
    
    # Trigger a business action (e.g. upload another file)
    print("Uploading file while SMTP is offline...")
    status, res = make_multipart_request(opener_cust, f"{BASE_URL}/files/upload", "fail_safe_test.pdf", "DUMMY FAIL DATA")
    assert status == 201, f"Expected 201, got {status}: {res}"
    print("Success: Endpoint returned 201 successfully despite mail service failure!")
    
    time.sleep(1)
    
    # Verify a failure log was created in Audit Logs
    status, res = make_request(opener_admin, f"{BASE_URL}/audit-logs?action=Email+Failed")
    assert status == 200, f"Failed to get audit logs: {res}"
    assert len(res["items"]) >= 1, "Expected at least one 'Email Failed' log"
    print(f"Success: 'Email Failed' log found in database! Details: {res['items'][0]['details']}")

    # Clean up
    make_request(opener_cust, f"{BASE_URL}/auth/logout", method="POST")
    make_request(opener_admin, f"{BASE_URL}/auth/logout", method="POST")
    print("\nAll Email Notification System tests passed successfully!")

if __name__ == "__main__":
    run_tests()
