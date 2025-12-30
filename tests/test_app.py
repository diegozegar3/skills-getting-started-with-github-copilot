from fastapi.testclient import TestClient
from urllib.parse import quote
import uuid

from src.app import app

client = TestClient(app)


def test_get_activities():
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    # Basic sanity check for a known activity
    assert "Basketball Team" in data


def test_signup_and_unregister_flow():
    activity = "Math Club"
    activity_enc = quote(activity, safe='')
    email = f"test+{uuid.uuid4().hex}@example.com"

    # Ensure email not present initially
    res = client.get("/activities")
    assert res.status_code == 200
    participants = res.json()[activity]["participants"]
    assert email not in participants

    # Sign up
    res = client.post(f"/activities/{activity_enc}/signup?email={email}")
    assert res.status_code == 200
    assert "Signed up" in res.json()["message"]

    # Verify present
    res = client.get("/activities")
    assert email in res.json()[activity]["participants"]

    # Unregister
    res = client.post(f"/activities/{activity_enc}/unregister?email={email}")
    assert res.status_code == 200
    assert "Unregistered" in res.json()["message"]

    # Verify removed
    res = client.get("/activities")
    assert email not in res.json()[activity]["participants"]
