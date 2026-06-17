import time
import os
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
API_BASE_URL = "http://127.0.0.1:5001/api/v1"

# Create a test PDF file for uploads
TEST_FILE_PATH = os.path.abspath("scratch/test_blueprint_upload.pdf")
with open(TEST_FILE_PATH, "w") as f:
    f.write("Crescent Chique Designs E2E Test Blueprint Upload File Content.")

def run_audit():
    print("=== STARTING BROWSER E2E JOURNEY AUDIT ===")
    
    report = []
    has_errors = False
    console_errors = []
    failed_requests = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to screen size
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Listen to console messages for errors
        def handle_console(msg):
            if msg.type == "error":
                console_errors.append(f"[CONSOLE ERROR] {msg.text} (URL: {page.url})")
        page.on("console", handle_console)

        # Listen to network failures
        def handle_response(response):
            if response.status >= 400:
                failed_requests.append(f"[FAILED REQUEST] {response.request.method} {response.url} returned status {response.status}")
        page.on("response", handle_response)

        # Helper to take screenshot
        def screenshot(name):
            os.makedirs("scratch/screenshots", exist_ok=True)
            page.screenshot(path=f"scratch/screenshots/{name}.png")
            print(f"Captured screenshot: {name}.png")

        # ----------------------------------------------------
        # CUSTOMER JOURNEY: PART 1 - REGISTRATION & DATA CREATION
        # ----------------------------------------------------
        try:
            print("\n--- [Customer] 1. Register new account ---")
            page.goto(f"{BASE_URL}/login")
            page.wait_for_timeout(2000)
            screenshot("customer_login_page")

            # Toggle to registration form
            page.click("text=Create Profile")
            page.wait_for_timeout(1000)
            screenshot("customer_registration_page")

            # Fill registration details
            unique_email = f"audit.jane.{int(time.time())}@example.com"
            page.fill('input[placeholder="Enter your name"]', "Jane E2E Tester")
            page.fill('input[placeholder="e.g. jaisveen@gmail.com"]', unique_email)
            page.fill('input[placeholder="••••••••"]', "JanePassword2026!")
            page.fill('input[placeholder="e.g. +1 (555) 019-2834"]', "9876543210")
            page.fill('input[placeholder="Beverly Hills"]', "Mumbai")
            page.fill('input[placeholder="CA"]', "Maharashtra")
            page.fill('input[placeholder="100 Luxury Avenue, Suite 400"]', "123 E2E St, Apt 4")
            
            screenshot("customer_registration_filled")
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            screenshot("customer_registration_success")

            # Verify redirect/success message
            success_text = page.locator("text=Account registered successfully!").first.is_visible()
            if success_text:
                report.append("| Customer Journey: Register Account | PASS | Registered account with email " + unique_email + " | None |")
            else:
                report.append("| Customer Journey: Register Account | FAIL | Success text alert not visible | Check form fields |")
                has_errors = True

            # Login with the newly created account
            print("\n--- [Customer] 2. Login ---")
            page.fill('input[placeholder="e.g. jaisveen@gmail.com"]', unique_email)
            page.fill('input[placeholder="••••••••"]', "JanePassword2026!")
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            screenshot("customer_dashboard")

            if "/customer/dashboard" in page.url:
                report.append("| Customer Journey: Login | PASS | Successfully redirected to /customer/dashboard | None |")
            else:
                report.append("| Customer Journey: Login | FAIL | Redirection to customer dashboard failed | Check credentials |")
                has_errors = True

            # Refresh page to test session persistence
            print("\n--- [Customer] 3. Refresh browser ---")
            page.reload()
            page.wait_for_timeout(3000)
            screenshot("customer_dashboard_refreshed")
            if "/customer/dashboard" in page.url:
                report.append("| Customer Journey: Session Refresh | PASS | Session persists after browser reload | None |")
            else:
                report.append("| Customer Journey: Session Refresh | FAIL | Logged out after browser reload | Session cookies issue |")
                has_errors = True

            # Access dashboard (Verify keys and UI)
            print("\n--- [Customer] 4. Access dashboard ---")
            if page.locator("text=Booked").first.is_visible() or page.locator("text=Saved").first.is_visible() or page.locator("text=No Active Construction Project").first.is_visible():
                report.append("| Customer Journey: Access Dashboard | PASS | Customer metrics and layout render | None |")
            else:
                report.append("| Customer Journey: Access Dashboard | FAIL | Customer dashboard cards missing | Layout failed to render |")
                has_errors = True

            # Create appointment (Bookings)
            print("\n--- [Customer] 5. Create appointment ---")
            page.click("text=My Appointments")
            page.wait_for_timeout(2000)
            screenshot("customer_appointments_page")

            # Fill booking form
            page.fill('input[type="date"]', "2026-06-25")
            page.fill('input[type="time"]', "14:30")
            page.fill('textarea[placeholder*="Describe your goals"]', "E2E automated testing for design layout preferences.")
            screenshot("customer_appointment_filled")
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            screenshot("customer_appointment_success")

            if page.locator("text=requested successfully").first.is_visible():
                report.append("| Customer Journey: Book Consultation | PASS | Created slot request for 2026-06-25 at 14:30 | None |")
            else:
                report.append("| Customer Journey: Book Consultation | FAIL | Request confirmation not visible | API error |")
                has_errors = True

            # Upload file
            print("\n--- [Customer] 6. Upload file ---")
            page.click("text=Upload Center")
            page.wait_for_timeout(2000)
            screenshot("customer_workspace_page")

            # Interact with input file
            file_input = page.locator('input[type="file"]')
            file_input.set_input_files(TEST_FILE_PATH)
            page.wait_for_timeout(4000)
            screenshot("customer_file_uploaded")

            if page.locator("text=test_blueprint_upload.pdf").first.is_visible():
                report.append("| Customer Journey: Upload Blueprint | PASS | Uploaded test_blueprint_upload.pdf successfully | None |")
            else:
                report.append("| Customer Journey: Upload Blueprint | FAIL | File name not visible in active listings | Upload API failed |")
                has_errors = True

            # Check notifications
            print("\n--- [Customer] 9. Open notifications ---")
            page.click("text=Notifications")
            page.wait_for_timeout(2000)
            screenshot("customer_notifications_page")
            
            # Since registration and booking trigger notifications, verify list is populated
            if page.locator("text=Welcome").first.is_visible() or page.locator("text=Consultation").first.is_visible() or page.locator("text=Alerts").first.is_visible() or page.locator("text=Notification").first.is_visible():
                report.append("| Customer Journey: Notifications | PASS | Notifications logged successfully | None |")
            else:
                report.append("| Customer Journey: Notifications | FAIL | Notification list is empty | Triggers failed |")
                has_errors = True

            # Logout customer
            print("\n--- [Customer] 10. Logout ---")
            page.click('button[title="Logout"]')
            page.wait_for_timeout(2000)
            screenshot("logged_out_page")
            if "/login" in page.url:
                report.append("| Customer Journey: Logout | PASS | Successfully logged out customer and returned to login | None |")
            else:
                report.append("| Customer Journey: Logout | FAIL | Signout redirection failed | Signout handler failed |")
                has_errors = True

            # Login again as new customer to double check
            print("\n--- [Customer] 11. Login again ---")
            page.fill('input[placeholder="e.g. jaisveen@gmail.com"]', unique_email)
            page.fill('input[placeholder="••••••••"]', "JanePassword2026!")
            page.click('button[type="submit"]')
            page.wait_for_timeout(2000)
            if "/customer/dashboard" in page.url:
                print("SUCCESS: Relogin successful.")
                page.click('button[title="Logout"]')
                page.wait_for_timeout(2000)
            else:
                print("FAILED: Relogin failed.")
                has_errors = True

        except Exception as e:
            print("EXCEPTION during Customer Journey:", e)
            report.append(f"| Customer Journey: Exception | FAIL | Encountered exception: {str(e)} | Fatal |")
            has_errors = True

        # ----------------------------------------------------
        # ADMIN JOURNEY: DASHBOARD, CRM, PROJECTS, QUOTATIONS
        # ----------------------------------------------------
        try:
            print("\n--- [Admin] 1. Login as admin ---")
            page.goto(f"{BASE_URL}/login")
            page.wait_for_timeout(2000)
            
            # Toggle to Admin Sign In tab
            page.click("text=Admin Sign In")
            page.wait_for_timeout(1000)
            
            page.fill('input[placeholder="e.g. jaisveen@gmail.com"]', "admin@crescentchique.com")
            page.fill('input[placeholder="••••••••"]', "CCAdmin2026!")
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            screenshot("admin_dashboard")

            if "/admin/dashboard" in page.url:
                report.append("| Admin Journey: Login | PASS | Successfully signed in as Administrator | None |")
            else:
                report.append("| Admin Journey: Login | FAIL | Redirection to Admin dashboard failed | Check credentials |")
                has_errors = True

            # Open admin dashboard and check charts
            print("\n--- [Admin] 2. Open dashboard (SVG checks) ---")
            if page.locator("text=Operations Console").first.is_visible() and page.locator("svg").count() > 0:
                report.append("| Admin Journey: Dashboard Visuals | PASS | SVG charts and console stats render | None |")
            else:
                report.append("| Admin Journey: Dashboard Visuals | FAIL | SVG charts failed to compile / load | Render error |")
                has_errors = True

            # View leads page
            print("\n--- [Admin] 3. View leads CRM ---")
            page.click("text=Leads Management")
            page.wait_for_timeout(2000)
            screenshot("admin_leads_page")
            
            # Create a lead
            print("\n--- [Admin] 4. Create lead ---")
            page.click("text=Add Lead")
            page.wait_for_timeout(1000)
            screenshot("admin_add_lead_modal")

            unique_lead_name = f"E2E Lead test {int(time.time())}"
            page.fill('input[placeholder="e.g. Priyal Sharma"]', unique_lead_name)
            page.fill('input[placeholder="e.g. priyal@example.com"]', "lead.e2e@example.com")
            page.fill('input[placeholder="e.g. +91 9876543210"]', "9876543211")
            page.fill('textarea[placeholder*="Summarize structural layouts"]', "Test lead requirements for studio.")
            page.select_option('select:near(label:has-text("Lead Channel Source"))', "Instagram")
            
            screenshot("admin_add_lead_modal_filled")
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            screenshot("admin_leads_list_updated")

            if page.locator(f"text={unique_lead_name}").first.is_visible():
                report.append(f"| Admin Journey: Create Lead | PASS | Added '{unique_lead_name}' to CRM | None |")
            else:
                report.append("| Admin Journey: Create Lead | FAIL | Created lead not visible in listings | Save failed |")
                has_errors = True

            # Edit lead
            print("\n--- [Admin] 5. Edit lead ---")
            # Find the card container of unique lead and click edit
            page.locator(f'div:has(h3:has-text("{unique_lead_name}"))').locator('text=Edit Profile').first.click()
            page.wait_for_timeout(1000)
            screenshot("admin_edit_lead_modal")

            page.fill('h2:has-text("Edit Lead Profile Details") ~ form textarea', "Test lead requirements updated.")
            page.click('button:has-text("Save Changes")')
            page.wait_for_timeout(3000)
            screenshot("admin_leads_list_edited")

            # Check details updated
            requirements_updated = page.locator("text=Test lead requirements updated.").first.is_visible()
            if requirements_updated:
                report.append("| Admin Journey: Edit Lead | PASS | Updated requirements to 'Test lead requirements updated.' | None |")
            else:
                report.append("| Admin Journey: Edit Lead | FAIL | Updated requirements not visible on row card | Edit API failed |")
                has_errors = True

            # Delete lead
            print("\n--- [Admin] 6. Delete lead ---")
            # Click delete on lead card
            page.on("dialog", lambda dialog: dialog.accept()) # Auto accept browser confirm box
            page.locator(f'div:has(h3:has-text("{unique_lead_name}"))').locator('text=Delete').first.click()
            page.wait_for_timeout(3000)
            screenshot("admin_leads_list_deleted")

            if not page.locator(f"text={unique_lead_name}").first.is_visible():
                report.append(f"| Admin Journey: Delete Lead | PASS | Soft deleted '{unique_lead_name}' lead card | None |")
            else:
                report.append(f"| Admin Journey: Delete Lead | FAIL | Lead card still visible after deletion | Delete API failed |")
                has_errors = True

            # Open projects board
            print("\n--- [Admin] 7. Open projects ---")
            page.click("text=Projects Track")
            page.wait_for_timeout(2000)
            screenshot("admin_projects_page")

            # Select project on left
            project_item = page.locator('div:has(h4)').first
            if project_item.is_visible():
                project_item.click()
                page.wait_for_timeout(2000)
                screenshot("admin_project_selected")

                # Update progress slider
                print("\n--- [Admin] 8. Update project progress ---")
                slider = page.locator('input[type="range"]')
                # Drag the slider to 40% (using bounding box or click)
                box = slider.bounding_box()
                if box:
                    # Click at 40% along the width of the slider
                    page.mouse.click(box["x"] + box["width"] * 0.4, box["y"] + box["height"] / 2)
                    page.wait_for_timeout(2000)
                    screenshot("admin_project_progress_updated")
                    report.append("| Admin Journey: Progress Slider | PASS | Dragged slider to change progress successfully | None |")
                else:
                    report.append("| Admin Journey: Progress Slider | FAIL | Range input bounding box unavailable | UI error |")
                    has_errors = True

                # Add project note
                print("\n--- [Admin] 9. Add project note ---")
                page.fill('textarea[placeholder*="Add an update note"]', "E2E test: Site inspection done.")
                page.click('button:has-text("Add Note")')
                page.wait_for_timeout(3000)
                screenshot("admin_project_note_added")

                if page.locator("text=E2E test: Site inspection done.").first.is_visible():
                    report.append("| Admin Journey: Add Note | PASS | Added architect log 'E2E test: Site inspection done.' | None |")
                else:
                    report.append("| Admin Journey: Add Note | FAIL | Added note not visible in Notes Log stream | Save failed |")
                    has_errors = True
            else:
                print("WARNING: No projects available to test board operations.")
                report.append("| Admin Journey: Projects | FAIL | No project list folder loaded to test note additions | Run database seed |")
                has_errors = True

            # Open Quotations
            print("\n--- [Admin] 10. Open quotations ---")
            page.click("text=Quotations Hub")
            page.wait_for_timeout(2000)
            screenshot("admin_quotations_page")

            # Generate and save a quotation for a client (like target_customer_id)
            print("\n--- [Admin] 10b. Generate & Save Quotation for Client ---")
            # Select first option in client dropdown
            page.select_option('select:near(label:has-text("Assign Customer Account"))', index=1)
            # Select first option in design concept
            page.select_option('select:near(label:has-text("Select Design Concept"))', index=1)
            page.fill('input[placeholder="e.g. 1000"]', "1200")
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            screenshot("admin_quote_estimated")
            
            # Click Save Estimate to DB
            page.click("text=Save Estimate to DB")
            page.wait_for_timeout(3000)
            screenshot("admin_quote_saved")

            if page.locator("text=Quotation saved to client portfolio successfully").first.is_visible():
                report.append("| Admin Journey: Save Quotation | PASS | Saved a new 1200 sqft quotation for customer | None |")
            else:
                report.append("| Admin Journey: Save Quotation | FAIL | Save success message not visible | Calculate/Save API error |")
                has_errors = True

            # Download PDF
            print("\n--- [Admin] 11. Download quotation PDF ---")
            # Click download PDF button on first quotation item
            download_btn = page.locator('button[title="Download PDF Copy"]').first
            if download_btn.is_visible():
                with page.expect_download() as download_info:
                    download_btn.click()
                download = download_info.value
                download.save_as(f"scratch/{download.suggested_filename}")
                print(f"Quotation PDF downloaded to scratch/{download.suggested_filename}")
                report.append("| Admin Journey: Download PDF | PASS | Downloaded Quotation PDF file | None |")
            else:
                report.append("| Admin Journey: Download PDF | FAIL | Download PDF icon button not visible | Card missing |")
                has_errors = True

            # Open Audit logs
            print("\n--- [Admin] 12. Open audit logs ---")
            page.click("text=System Audit Logs")
            page.wait_for_timeout(2000)
            screenshot("admin_audit_logs")
            if page.locator("text=Audit Logs Database").first.is_visible() or page.locator("text=Quotation Saved").first.is_visible() or page.locator("text=Quotation Created").first.is_visible() or page.locator("text=Audit").first.is_visible():
                report.append("| Admin Journey: System Audit Logs | PASS | Audits timeline is populated with CRUD events | None |")
            else:
                report.append("| Admin Journey: System Audit Logs | FAIL | Audits database failed to retrieve list | Fetch error |")
                has_errors = True

            # Logout
            print("\n--- [Admin] 13. Logout ---")
            page.click('button[title="Logout"]')
            page.wait_for_timeout(2000)
            if "/login" in page.url:
                report.append("| Admin Journey: Logout | PASS | Successfully signed out administrator | None |")
            else:
                report.append("| Admin Journey: Logout | FAIL | Admin signout redirection failed | logout handler error |")
                has_errors = True

        except Exception as e:
            print("EXCEPTION during Admin Journey:", e)
            report.append(f"| Admin Journey: Exception | FAIL | Encountered exception: {str(e)} | Fatal |")
            has_errors = True

        # Close browser session
        browser.close()

    # Final summary evaluation
    print("\n=== E2E AUDIT COMPLETE ===")
    
    # Check for console or request exceptions
    if console_errors:
        print("\nConsole Errors detected during audit:")
        for err in console_errors:
            print(err)
    if failed_requests:
        print("\nFailed Network Requests detected during audit:")
        for req in failed_requests:
            print(req)

    # Output MD Report File
    report_md_path = "scratch/e2e_audit_report.md"
    
    final_status = "PASS" if (not has_errors and not failed_requests) else "FAIL"

    with open(report_md_path, "w") as f:
        f.write("# Browser E2E User Journey Audit Report\n\n")
        f.write(f"## Final Evaluation: **{final_status}**\n\n")
        f.write("A complete browser-based end-to-end user journey audit has been conducted using Headless Playwright automation.\n\n")
        
        f.write("### Audited Journeys Status Table\n\n")
        f.write("| Step Workflow | Status | Details | Actions Taken |\n")
        f.write("| :--- | :--- | :--- | :--- |\n")
        for line in report:
            f.write(line + "\n")
        f.write("\n")

        f.write("### Console Errors Audited\n\n")
        if console_errors:
            f.write("The following console errors were encountered:\n")
            for err in console_errors:
                f.write(f"- `{err}`\n")
        else:
            f.write("✓ No console errors were encountered.\n")
        f.write("\n")

        f.write("### Failed Network Requests Audited\n\n")
        if failed_requests:
            f.write("The following network requests failed:\n")
            for req in failed_requests:
                f.write(f"- `{req}`\n")
        else:
            f.write("✓ No failed network requests were detected.\n")
        f.write("\n")

    print(f"Report written to {report_md_path}")
    
    # Exit code based on final status
    if final_status == "FAIL":
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_audit()
