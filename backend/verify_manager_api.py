import httpx

client = httpx.Client(base_url="http://localhost:8000", timeout=10.0)

# Test Rajesh
print("--- 1. Testing Rajesh Kumar (Manager) ---")
r = client.post("/auth/login", json={"email": "rajesh.kumar@example.com", "password": "Rajesh@123"})
assert r.status_code == 200, f"Rajesh login failed: {r.text}"
rajesh_data = r.json()
print(f"Rajesh login success: {rajesh_data['name']}, Role: {rajesh_data['role']}")
mgr_headers = {"Authorization": f"Bearer {rajesh_data['access_token']}"}

r_dash = client.get("/manager/dashboard", headers=mgr_headers)
assert r_dash.status_code == 200, f"Dashboard failed: {r_dash.text}"
print("Manager Dashboard OK:", list(r_dash.json().keys()))

r_team = client.get("/manager/team", headers=mgr_headers)
assert r_team.status_code == 200, f"Team failed: {r_team.text}"
team_members = [m["name"] for m in r_team.json()]
print("Manager Team OK:", team_members)
assert "Neha Sharma" in team_members, "Neha should be in team"
assert "Priya Patel" in team_members, "Priya should be in team"
assert "Amit Singh" not in team_members, "Amit should NOT be in team (different manager)"

r_reqs = client.get("/manager/requests", headers=mgr_headers)
assert r_reqs.status_code == 200, f"Requests failed: {r_reqs.text}"
reqs = r_reqs.json()
print(f"Manager Requests OK: {len(reqs)} requests found")

if len(reqs) > 0:
    req_id = reqs[0]["id"]
    r_detail = client.get(f"/manager/requests/{req_id}", headers=mgr_headers)
    assert r_detail.status_code == 200, f"Request detail failed: {r_detail.text}"
    detail = r_detail.json()
    print(f"Manager Request Detail for #{req_id} OK: {detail['employee']['name']} - {detail['request_type']}")
    print(f"Leave balance present: {detail['leave_balance'] is not None}")
    print(f"Overlapping requests count: {len(detail['overlapping_requests'])}")
    print(f"Policy guidance items: {len(detail['policy_guidance'])}")

# Test Filter by status
r_filter = client.get("/manager/requests?status=Pending", headers=mgr_headers)
assert r_filter.status_code == 200
print(f"Pending requests filter OK: {len(r_filter.json())} pending")

# Test Approve / Reject
if len(reqs) > 0:
    test_req = [rq for rq in reqs if rq["status"].lower() == "pending"]
    if test_req:
        target_id = test_req[0]["id"]
        # Test approve
        r_app = client.patch(
            f"/leave-requests/{target_id}/approve",
            json={"comment": "Approved by manager via verification script."},
            headers=mgr_headers,
        )
        assert r_app.status_code == 200, f"Approve failed: {r_app.text}"
        assert r_app.json()["status"] == "Approved"
        assert r_app.json()["manager_comment"] == "Approved by manager via verification script."
        print(f"Approve endpoint OK for request #{target_id}: status={r_app.json()['status']}")

# Test Employees
for email, pwd in [
    ("neha.sharma@example.com", "Neha@123"),
    ("priya.patel@example.com", "Priya@123"),
    ("amit.singh@example.com", "Amit@123"),
]:
    print(f"\n--- Testing Employee: {email} ---")
    r_emp = client.post("/auth/login", json={"email": email, "password": pwd})
    assert r_emp.status_code == 200, f"Login failed for {email}: {r_emp.text}"
    emp_data = r_emp.json()
    print(f"Login success: {emp_data['name']}, Role: {emp_data['role']}")
    emp_headers = {"Authorization": f"Bearer {emp_data['access_token']}"}

    for path in ["/manager/dashboard", "/manager/team", "/manager/requests"]:
        r_forbidden = client.get(path, headers=emp_headers)
        assert r_forbidden.status_code == 403, f"Expected 403 on {path} for {email}, got {r_forbidden.status_code}: {r_forbidden.text}"
        print(f"Forbidden verified on {path}: HTTP {r_forbidden.status_code}")

print("\n=== ALL BACKEND API & SECURITY TESTS PASSED! ===")
