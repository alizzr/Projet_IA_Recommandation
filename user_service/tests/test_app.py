import json
import os
import pytest
from app import app, db, User, CartItem

@pytest.fixture
def client():
    # Mode test
    app.config["TESTING"] = True
    # Base de données IN-MEMORY → toujours vide au début
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    # Initialiser une base propre
    with app.app_context():
        db.drop_all()
        db.create_all()

    # Client de test Flask
    with app.test_client() as client:
        yield client


def test_register_user(client):
    res = client.post("/register", json={
        "email": "test@example.com",
        "password": "secret"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["user"]["email"] == "test@example.com"


def test_duplicate_email(client):
    client.post("/register", json={
        "email": "test@example.com",
        "password": "secret"
    })
    res = client.post("/register", json={
        "email": "test@example.com",
        "password": "secret"
    })
    assert res.status_code == 400


def test_login(client):
    client.post("/register", json={
        "email": "user@x.com",
        "password": "123"
    })
    res = client.post("/login", json={
        "email": "user@x.com",
        "password": "123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "id" in data


def test_add_to_cart(client):
    # Create user
    r = client.post("/register", json={
        "email": "test@cart.com",
        "password": "123"
    })
    user_id = r.get_json()["user"]["id"]

    res = client.post(f"/users/{user_id}/cart", json={
        "product_id": 5,
        "name": "MacBook Pro",
        "price": 1999.99
    })

    assert res.status_code == 200


def test_user_not_found(client):
    res = client.get("/users/999")
    assert res.status_code == 404
