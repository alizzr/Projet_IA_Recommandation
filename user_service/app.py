from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# CONFIGURATION BASE DE DONNÉES (SQLite)
# Le fichier users.db sera créé automatiquement
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODÈLE (La structure de la table) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False) # En prod: Hacher le MDP !
    is_admin = db.Column(db.Boolean, default=False)
    cart = db.relationship('CartItem', backref='user', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_admin": self.is_admin,
            "cart": [item.to_dict() for item in self.cart]
        }

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {"product_id": self.product_id, "name": self.name, "price": self.price}

# Création des tables au démarrage
with app.app_context():
    db.create_all()

# --- ROUTES CRUD UTILISATEUR (Comme demandé dans le PDF) ---

# 1. CRÉER (Inscription)
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email déjà utilisé"}), 400
    
    new_user = User(email=data['email'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Utilisateur créé", "user": new_user.to_dict()}), 201

# 2. LIRE (Login / Récupérer info)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if user:
        return jsonify(user.to_dict())
    return jsonify({"message": "Identifiants incorrects"}), 401

@app.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict())

# 3. METTRE À JOUR
@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json
    if 'email' in data: user.email = data['email']
    if 'password' in data: user.password = data['password']
    db.session.commit()
    return jsonify(user.to_dict())

# 4. SUPPRIMER
@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Utilisateur supprimé"})

# --- GESTION PANIER ---
@app.route('/users/<int:user_id>/cart', methods=['POST'])
def add_to_cart(user_id):
    data = request.json
    new_item = CartItem(
        user_id=user_id, 
        product_id=data['product_id'],
        name=data['name'],
        price=data['price']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Ajouté au panier"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)