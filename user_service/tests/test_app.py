import json
import pytest
# On importe l'application depuis le fichier app.py situé au même endroit
from app import app, db

@pytest.fixture
def client():
    # Mode test activé
    app.config["TESTING"] = True
    # Base de données en mémoire (RAM) pour ne pas casser la vraie base
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.create_all() # On crée les tables vides

    with app.test_client() as client:
        yield client
    
    # Nettoyage après le test
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
    # 1. On crée un user
    client.post("/register", json={"email": "user@x.com", "password": "123"})
    
    # 2. On essaie de se connecter
    res = client.post("/login", json={"email": "user@x.com", "password": "123"})
    assert res.status_code == 200
    assert "id" in res.get_json()

def test_add_to_cart(client):
    # 1. Créer user
    r = client.post("/register", json={"email": "cart@test.com", "password": "123"})
    user_id = r.get_json()["user"]["id"]

    # 2. Ajouter au panier (ATTENTION : Route corrigée, sans le /users devant)
    res = client.post(f"/{user_id}/cart", json={
        "product_id": 5,
        "name": "MacBook Pro",
        "price": 1999.99
    })
    assert res.status_code == 200

def test_user_not_found(client):
    # Route corrigée (sans le /users devant)
    res = client.get("/999/cart") 
    assert res.status_code == 404