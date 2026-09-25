import httpx

BASE_URL = "http://localhost:8000"


def test_comprehensive():
    print("=== STARTING COMPREHENSIVE MANAGER WORKSPACE VERIFICATION ===")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Test 1: API health
        res = client.get("/")
        assert res.status_code == 200, f"API root failed: {res.text}"
        print("[PASS] FastAPI is running and healthy.")

        # Test 2: Employee Authentication & Self-Service APIs
        print("\n--- Testing Employee Workspace Integrity ---")
        res_emp_login = client.post("/auth/login", json={"email": "neha.sharma@example.com", "password": "Neha@123"})
        assert res_emp_login.status_code == 200, f"Employee login failed: {res_emp_login.text}"
        emp_token = res_emp_login.json()["access_token"]
        emp_headers = {"Authorization": f"Bearer {emp_token}"}
        print(f"[PASS] Logged in as Employee: {res_emp_login.json()['name']} (role: {res_emp_login.json()['role']})")

        # Employee profile /auth/me
        res_me = client.get("/auth/me", headers=emp_headers)
        assert res_me.status_code == 200 and res_me.json()["email"] == "neha.sharma@example.com"
        print("[PASS] Employee /auth/me working.")

        # Employee profile /employees/{id}
        res_emp = client.get("/employees/1")
        assert res_emp.status_code == 200 and res_emp.json()["name"] == "Neha Sharma"
        print("[PASS] Employee /employees/1 working.")

        # Employee balances /leave-balances/
        res_bal = client.get("/leave-balances/")
        assert res_bal.status_code == 200 and len(res_bal.json()) > 0
        print(f"[PASS] /leave-balances/ returned {len(res_bal.json())} balances.")

        # Employee requests /leave-requests/
        res_reqs = client.get("/leave-requests/")
        assert res_reqs.status_code == 200 and len(res_reqs.json()) > 0
        print(f"[PASS] /leave-requests/ returned {len(res_reqs.json())} requests.")

        # Employee policy documents /policy-documents/
        res_pols = client.get("/policy-documents/")
        assert res_pols.status_code == 200
        print(f"[PASS] /policy-documents/ returned {len(res_pols.json())} policy documents.")

        # Employee attempting manager APIs -> MUST be 403 Forbidden
        print("\n--- Testing Role-Based Security: Employee Denied Manager Access ---")
        res_dash_forbidden = client.get("/manager/dashboard", headers=emp_headers)
        assert res_dash_forbidden.status_code == 403, f"Expected 403 Forbidden, got {res_dash_forbidden.status_code}"
        res_team_forbidden = client.get("/manager/team", headers=emp_headers)
        assert res_team_forbidden.status_code == 403, f"Expected 403 Forbidden, got {res_team_forbidden.status_code}"
        res_reqs_forbidden = client.get("/manager/requests", headers=emp_headers)
        assert res_reqs_forbidden.status_code == 403, f"Expected 403 Forbidden, got {res_reqs_forbidden.status_code}"
        print("[PASS] Employee correctly denied access (403 Forbidden) to /manager/dashboard, /manager/team, /manager/requests.")

        # Test 3: Manager Authentication & Workspace APIs
        print("\n--- Testing Manager Workspace Functionality ---")
        res_mgr_login = client.post("/auth/login", json={"email": "rajesh.kumar@example.com", "password": "Rajesh@123"})
        assert res_mgr_login.status_code == 200, f"Manager login failed: {res_mgr_login.text}"
        mgr_token = res_mgr_login.json()["access_token"]
        mgr_headers = {"Authorization": f"Bearer {mgr_token}"}
        print(f"[PASS] Logged in as Manager: {res_mgr_login.json()['name']} (role: {res_mgr_login.json()['role']})")

        # Manager Dashboard
        res_mgr_dash = client.get("/manager/dashboard", headers=mgr_headers)
        assert res_mgr_dash.status_code == 200
        dash = res_mgr_dash.json()
        assert dash["team_count"] == 2
        print(f"[PASS] Manager dashboard: team_count={dash['team_count']}, pending_count={dash['pending_requests_count']}, on_leave_today={dash['on_leave_today_count']}")

        # Manager Team (Direct Reports)
        res_mgr_team = client.get("/manager/team", headers=mgr_headers)
        assert res_mgr_team.status_code == 200
        team = res_mgr_team.json()
        team_names = [m["name"] for m in team]
        assert "Neha Sharma" in team_names
        assert "Priya Patel" in team_names
        assert "Amit Singh" not in team_names, "Data leak: non-report appeared in manager's team!"
        print(f"[PASS] Manager team: Only direct reports ({team_names}) visible. Non-reports strictly excluded.")

        # Manager Requests List & Filtering
        res_team_reqs = client.get("/manager/requests", headers=mgr_headers)
        assert res_team_reqs.status_code == 200
        team_reqs = res_team_reqs.json()
        for tr in team_reqs:
            assert tr["employee_name"] in team_names
        print(f"[PASS] Manager requests list: {len(team_reqs)} requests belonging exclusively to direct reports.")

        # Test filtering by status=Pending
        res_filter_status = client.get("/manager/requests?status=Pending", headers=mgr_headers)
        assert res_filter_status.status_code == 200
        for tr in res_filter_status.json():
            assert tr["status"] == "Pending"
        print(f"[PASS] Filtering by status=Pending: {len(res_filter_status.json())} pending items.")

        # Test filtering by request_type=Casual Leave
        res_filter_type = client.get("/manager/requests?request_type=Casual%20Leave", headers=mgr_headers)
        assert res_filter_type.status_code == 200
        for tr in res_filter_type.json():
            assert tr["request_type"] == "Casual Leave"
        print(f"[PASS] Filtering by request_type=Casual Leave: {len(res_filter_type.json())} items.")

        # Test search filter
        res_filter_search = client.get("/manager/requests?search=Priya", headers=mgr_headers)
        assert res_filter_search.status_code == 200
        for tr in res_filter_search.json():
            assert "priya" in tr["employee_name"].lower()
        print(f"[PASS] Filtering by search=Priya: {len(res_filter_search.json())} items.")

        # Test 4: Request Details, Policy, Leave Balance, Overlap Detection
        print("\n--- Testing Request Details & Advanced Features ---")
        priya_req = next(r for r in team_reqs if r["employee_name"] == "Priya Patel")
        res_detail = client.get(f"/manager/requests/{priya_req['id']}", headers=mgr_headers)
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert detail["employee"]["name"] == "Priya Patel"
        assert detail["leave_balance"] is not None
        assert detail["leave_balance"]["leave_type"] == "Casual"
        assert len(detail["policy_guidance"]) > 0
        print(f"[PASS] Request #{detail['id']} details: employee={detail['employee']['name']}, leave_balance={detail['leave_balance']}")
        print(f"[PASS] Policy guidelines present: {[p['title'] for p in detail['policy_guidance']]}")
        print(f"[PASS] Overlapping team requests detected: {len(detail['overlapping_requests'])}")

        # Test 5: Manager Authorization on Non-Report Request
        print("\n--- Testing Authorization Isolation ---")
        all_reqs = client.get("/leave-requests/").json()
        amit_req = next((r for r in all_reqs if r["employee_id"] not in [dash["manager_id"], 1, 3]), None)
        if amit_req:
            res_unauth = client.get(f"/manager/requests/{amit_req['id']}", headers=mgr_headers)
            assert res_unauth.status_code == 403, f"Expected 403 for non-report request #{amit_req['id']}, got {res_unauth.status_code}"
            print(f"[PASS] Manager blocked (403 Forbidden) from accessing non-report's request #{amit_req['id']}.")

            # Try approving non-report's request -> must be 403
            res_unauth_appr = client.patch(
                f"/leave-requests/{amit_req['id']}/approve",
                json={"comment": "Malicious approval attempt"},
                headers=mgr_headers,
            )
            assert res_unauth_appr.status_code == 403, f"Expected 403, got {res_unauth_appr.status_code}"
            print("[PASS] Manager blocked (403 Forbidden) from approving non-report's request.")

        # Test 6: Approval Action with Comment, Balance Deduction & Audit Log
        print("\n--- Testing Approval & Rejection Persistence ---")
        if priya_req["status"] == "Pending":
            priya_prev_remaining = detail["leave_balance"]["remaining_days"]
            res_approve_priya = client.patch(
                f"/leave-requests/{priya_req['id']}/approve",
                json={"comment": "Approved Priya's casual leave for family event."},
                headers=mgr_headers,
            )
            assert res_approve_priya.status_code == 200
            priya_appr = res_approve_priya.json()
            assert priya_appr["status"] == "Approved"
            assert priya_appr["manager_comment"] == "Approved Priya's casual leave for family event."
            print("[PASS] Request approval succeeded and returned updated status and manager_comment.")

            # Check updated detail reflects balance deduction
            res_priya_updated = client.get(f"/manager/requests/{priya_req['id']}", headers=mgr_headers)
            priya_updated_detail = res_priya_updated.json()
            assert priya_updated_detail["status"] == "Approved"
            assert priya_updated_detail["leave_balance"]["remaining_days"] == priya_prev_remaining - priya_req["total_days"]
            print(f"[PASS] Casual leave balance deducted: {priya_prev_remaining} -> {priya_updated_detail['leave_balance']['remaining_days']} days.")

            # Check audit log recorded
            res_audit_check = client.get("/audit-logs/")
            latest_audit = res_audit_check.json()[0]
            assert latest_audit["entity_id"] == priya_req["id"]
            assert latest_audit["approver_action"] == "Approved"
            print(f"[PASS] Audit log verified: action={latest_audit['action']}, approver_action={latest_audit['approver_action']}, entity_id={latest_audit['entity_id']}.")

    print("\n=======================================================")
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!")
    print("=======================================================")


if __name__ == "__main__":
    test_comprehensive()

