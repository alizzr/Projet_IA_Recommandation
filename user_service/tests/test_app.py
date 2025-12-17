import sys
import os
import pytest

# --- CORRECTION DU CHEMIN (Le fix est ici) ---
# On ajoute le dossier parent au "chemin de recherche" de Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# ---------------------------------------------

from app import app, db

@pytest.fixture
def client():
    # Mode test activé
    app.config["TESTING"] = True
    # Base de données en mémoire (RAM)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.create_all() # Création des tables

    with app.test_client() as client:
        yield client
    
    # Nettoyage
    with app.app_context():
        db.drop_all()

def test_register_user(client):
    res = client.post("/register", json={
        "email": "test@example.com",
        "password": "secret"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["user"]["email"] == "test@example.com"

def test_login(client):
    client.post("/register", json={"email": "user@x.com", "password": "123"})
    res = client.post("/login", json={"email": "user@x.com", "password": "123"})
    assert res.status_code == 200
    assert "id" in res.get_json()

def test_add_to_cart(client):
    r = client.post("/register", json={"email": "cart@test.com", "password": "123"})
    user_id = r.get_json()["user"]["id"]

    # Test avec la route sans le /users (car on teste app.py direct)
    res = client.post(f"/{user_id}/cart", json={
        "product_id": 5,
        "name": "MacBook Pro",
        "price": 1999.99
    })
    assert res.status_code == 200

def test_user_not_found(client):
    res = client.get("/999/cart") 
    assert res.status_code == 404