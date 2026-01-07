import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_read_main():
    response = client.get("/", follow_redirects=False)
    # Should redirect to /static/index.html
    assert response.status_code in (302, 307)
    assert "/static/index.html" in response.headers["location"]

def test_activities_list():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
# Add more tests as needed for signup, unregister, etc.
def test_signup_for_activity():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Check participant added
    response2 = client.get("/activities")
    assert email in response2.json()[activity]["participants"]

# Add more tests as needed for signup, unregister, etc.
