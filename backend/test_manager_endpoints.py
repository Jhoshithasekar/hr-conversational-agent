import httpx

BASE_URL = "http://localhost:8000"


def run_tests():
    print("--- 1. Testing Employee Login and Forbidden Manager Access ---")
    with httpx.Client(base_url=BASE_URL) as client:
        # Login as Neha (Employee)
        res_neha = client.post("/auth/login", json={"email": "neha.sharma@example.com", "password": "Password@123"})
        if res_neha.status_code != 200:
            # Try Neha@123
            res_neha = client.post("/auth/login", json={"email": "neha.sharma@example.com", "password": "Neha@123"})
        assert res_neha.status_code == 200, f"Neha login failed: {res_neha.text}"
        neha_token = res_neha.json()["access_token"]
        print(f"Logged in as Neha (role: {res_neha.json()['role']})")

        # Try to access manager dashboard as Employee
        headers_neha = {"Authorization": f"Bearer {neha_token}"}
        res_forbidden = client.get("/manager/dashboard", headers=headers_neha)
        assert res_forbidden.status_code == 403, f"Expected 403 Forbidden, got {res_forbidden.status_code}"
        print("Employee received 403 Forbidden on /manager/dashboard as expected.")

        print("\n--- 2. Testing Manager Login and Dashboard ---")
        # Login as Rajesh (Manager)
        res_mgr = client.post("/auth/login", json={"email": "rajesh.kumar@example.com", "password": "Manager@123"})
        assert res_mgr.status_code == 200, f"Manager login failed: {res_mgr.text}"
        mgr_token = res_mgr.json()["access_token"]
        headers_mgr = {"Authorization": f"Bearer {mgr_token}"}
        print(f"Logged in as Manager: {res_mgr.json()['name']} (role: {res_mgr.json()['role']})")

        # Access manager dashboard
        res_dash = client.get("/manager/dashboard", headers=headers_mgr)
        assert res_dash.status_code == 200, f"Dashboard failed: {res_dash.text}"
        dash_data = res_dash.json()
        print("Dashboard response:", dash_data)
        assert dash_data["team_count"] == 2, f"Expected team_count 2, got {dash_data['team_count']}"
        assert dash_data["pending_requests_count"] >= 2, f"Expected >= 2 pending requests, got {dash_data['pending_requests_count']}"

        print("\n--- 3. Testing Manager Direct Reports (/manager/team) ---")
        res_team = client.get("/manager/team", headers=headers_mgr)
        assert res_team.status_code == 200, f"Team failed: {res_team.text}"
        team_data = res_team.json()
        team_names = [t["name"] for t in team_data]
        print("Team members:", team_names)
        assert "Neha Sharma" in team_names and "Priya Patel" in team_names
        assert "Amit Singh" not in team_names, "Non-report Amit Singh must NOT appear in Rajesh's team!"

        print("\n--- 4. Testing Manager Requests List (/manager/requests) ---")
        res_reqs = client.get("/manager/requests", headers=headers_mgr)
        assert res_reqs.status_code == 200, f"Requests failed: {res_reqs.text}"
        reqs = res_reqs.json()
        print(f"Found {len(reqs)} requests for direct reports.")
        for r in reqs:
            assert r["employee_name"] in ["Neha Sharma", "Priya Patel"], f"Unauthorized request from {r['employee_name']}"

        # Test filtering by status
        res_pending = client.get("/manager/requests?status=pending", headers=headers_mgr)
        assert res_pending.status_code == 200
        for r in res_pending.json():
            assert r["status"].lower() == "pending"

        # Test filtering by request_type
        res_sick = client.get("/manager/requests?request_type=Sick%20Leave", headers=headers_mgr)
        assert res_sick.status_code == 200
        for r in res_sick.json():
            assert r["request_type"] == "Sick Leave"

        print("\n--- 5. Testing Request Detail & Overlap Detection ---")
        # Find Neha's request
        neha_req = next(r for r in reqs if r["employee_name"] == "Neha Sharma" and r["status"].lower() == "pending")
        res_detail = client.get(f"/manager/requests/{neha_req['id']}", headers=headers_mgr)
        assert res_detail.status_code == 200, f"Detail failed: {res_detail.text}"
        detail = res_detail.json()
        print(f"Request Detail for #{detail['id']}: type={detail['request_type']}, leave_balance={detail['leave_balance']}")
        print(f"Overlapping requests found: {len(detail['overlapping_requests'])}")
        assert detail["leave_balance"] is not None, "Leave balance should be present for Sick Leave"
        assert len(detail["overlapping_requests"]) >= 1, "Priya's overlapping leave request should be detected!"

        print("\n--- 6. Testing Unauthorized Access to Non-Report's Request ---")
        # Find Amit's request
        res_all_leaves = client.get("/leave-requests/")
        amit_req = next((r for r in res_all_leaves.json() if r["employee_id"] != dash_data["manager_id"] and r["reason"] == "Personal work."), None)
        if amit_req:
            res_amit_detail = client.get(f"/manager/requests/{amit_req['id']}", headers=headers_mgr)
            assert res_amit_detail.status_code == 403, f"Expected 403 for non-report request, got {res_amit_detail.status_code}"
            print("Manager received 403 Forbidden for non-report's request as expected.")

        print("\n--- 7. Testing Approval with Comment, Balance Deduction & Audit Log ---")
        prev_remaining = detail["leave_balance"]["remaining_days"]
        res_approve = client.patch(
            f"/leave-requests/{neha_req['id']}/approve",
            json={"comment": "Approved. Rest well and get better soon!"},
            headers=headers_mgr,
        )
        assert res_approve.status_code == 200, f"Approval failed: {res_approve.text}"
        approve_data = res_approve.json()
        print("Approval response:", approve_data)
        assert approve_data["status"] == "Approved"
        assert approve_data["manager_comment"] == "Approved. Rest well and get better soon!"

        # Verify detail now reflects Approved, comment, and updated leave balance
        res_detail_updated = client.get(f"/manager/requests/{neha_req['id']}", headers=headers_mgr)
        updated_detail = res_detail_updated.json()
        assert updated_detail["status"] == "Approved"
        assert updated_detail["manager_comment"] == "Approved. Rest well and get better soon!"
        print(f"Previous Sick balance: {prev_remaining}, Updated Sick balance: {updated_detail['leave_balance']['remaining_days']}")
        assert updated_detail["leave_balance"]["remaining_days"] == prev_remaining - detail["total_days"]

        # Verify audit log was recorded
        res_audits = client.get("/audit-logs/")
        latest_audit = res_audits.json()[0]
        print(f"Latest Audit Log: user={latest_audit['user_id']}, action={latest_audit['action']}, approver_action={latest_audit['approver_action']}")
        assert latest_audit["action"] == "approve_leave_request"
        assert latest_audit["approver_action"] == "Approved"
        assert latest_audit["entity_id"] == neha_req["id"]

        print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()

