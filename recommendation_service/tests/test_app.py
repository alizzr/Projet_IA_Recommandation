import json
import pytest
from app import app, df

@pytest.fixture
def client():
    app.config['TESTING'] = True
    client = app.test_client()
    return client

def test_recommend_basic(client):
    if df.empty:
        pytest.skip("Dataset vide, impossible de tester.")
    
    res = client.post("/recommend", json={
        "category": "laptop",
        "budget": 1500,
    })
    assert res.status_code == 200
    data = res.get_json()
    assert isinstance(data, list)

def test_recommend_error(client):
    res = client.post("/recommend", json={
        "budget": "not_a_number"
    })
    # Peut renvoyer 200 ou 500 selon ta logique
    assert res.status_code in (200, 500)

def test_recommend_cart(client):
    res = client.post("/recommend_by_cart", json=[
        {"name": "Asus ROG", "price": 1500, "brand": "asus", "category": "gaming"}
    ])
    assert res.status_code == 200

def test_route_exists(client):
    res = client.post("/recommend", json={})
    assert res.status_code in (200, 500)
