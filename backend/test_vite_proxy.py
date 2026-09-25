import httpx

client = httpx.Client(base_url="http://127.0.0.1:5173/api", timeout=10.0)

print("=== Testing Vite Proxy to Backend ===")

# Login as Rajesh
r_login = client.post("/auth/login", json={"email": "rajesh.kumar@example.com", "password": "Rajesh@123"})
assert r_login.status_code == 200, f"Login via Vite failed: {r_login.text}"
rajesh = r_login.json()
print("Rajesh login via Vite proxy SUCCESS:", rajesh["name"], "Role:", rajesh["role"])
mgr_headers = {"Authorization": f"Bearer {rajesh['access_token']}"}

# Dashboard via Vite proxy
r_dash = client.get("/manager/dashboard", headers=mgr_headers)
assert r_dash.status_code == 200, f"Dashboard via Vite failed: {r_dash.text}"
dash = r_dash.json()
print(f"Dashboard via Vite: team_count={dash['team_count']}, pending={dash['pending_requests_count']}, on_leave_today={dash['on_leave_today_count']}")

# Team via Vite proxy
r_team = client.get("/manager/team", headers=mgr_headers)
assert r_team.status_code == 200, f"Team via Vite failed: {r_team.text}"
team = r_team.json()
team_names = [m["name"] for m in team]
print(f"Team via Vite: {team_names}")
assert "Neha Sharma" in team_names
assert "Priya Patel" in team_names
assert "Amit Singh" not in team_names

# Requests via Vite proxy
r_reqs = client.get("/manager/requests", headers=mgr_headers)
assert r_reqs.status_code == 200, f"Requests via Vite failed: {r_reqs.text}"
reqs = r_reqs.json()
print(f"Requests via Vite: {len(reqs)} items")

# Test Employee login via Vite proxy
r_emp_login = client.post("/auth/login", json={"email": "neha.sharma@example.com", "password": "Neha@123"})
assert r_emp_login.status_code == 200
emp_headers = {"Authorization": f"Bearer {r_emp_login.json()['access_token']}"}

# Test Employee blocked from manager endpoints via Vite
for path in ["/manager/dashboard", "/manager/team", "/manager/requests"]:
    r_forbidden = client.get(path, headers=emp_headers)
    assert r_forbidden.status_code == 403, f"Expected 403 on {path} for employee, got {r_forbidden.status_code}"

print("\n[PASS] ALL END-TO-END VITE DEV SERVER PROXY TESTS PASSED!")
