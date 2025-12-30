from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
# Dossier Data pour ne pas perdre le panier au redémarrage
data_dir = os.path.join(basedir, 'data')
os.makedirs(data_dir, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(data_dir, 'interactions.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODÈLES ---
class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    def to_dict(self): return {"product_id": self.product_id, "name": self.name, "price": self.price, "image": self.image}

class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    def to_dict(self): return {"product_id": self.product_id, "name": self.name, "price": self.price, "image": self.image}

# Ajout pour le paiement
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="Confirmée")

# --- ROUTES PANIER ---
@app.route('/cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([i.to_dict() for i in items])

@app.route('/cart/<int:user_id>', methods=['POST'])
def add_to_cart(user_id):
    data = request.json
    # On évite les doublons
    exists = CartItem.query.filter_by(user_id=user_id, product_id=data.get('product_id', data.get('id'))).first()
    if exists: return jsonify({"message": "Déjà présent"}), 200
    
    new_item = CartItem(
        user_id=user_id, 
        product_id=data.get('product_id', data.get('id')), # Gère les deux cas
        name=data['name'], 
        price=data['price'], 
        image=data.get('image')
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Ajouté"})

@app.route('/cart/<int:user_id>/<int:product_id>', methods=['DELETE'])
def remove_from_cart(user_id, product_id):
    CartItem.query.filter_by(user_id=user_id, product_id=product_id).delete()
    db.session.commit()
    return jsonify({"message": "Supprimé"})

# --- ROUTES FAVORIS ---
@app.route('/wishlist/<int:user_id>', methods=['GET'])
def get_wishlist(user_id):
    items = WishlistItem.query.filter_by(user_id=user_id).all()
    return jsonify([i.to_dict() for i in items])

# --- ROUTE PAIEMENT (Nouveau) ---
@app.route('/orders/<int:user_id>', methods=['POST'])
def create_order(user_id):
    # 1. On récupère le panier
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    if not cart_items:
        return jsonify({"message": "Panier vide"}), 400
    
    # 2. On calcule le total
    total = sum(item.price for item in cart_items)
    
    # 3. On crée la commande
    new_order = Order(user_id=user_id, total_price=total)
    db.session.add(new_order)
    
    # 4. On vide le panier
    for item in cart_items:
        db.session.delete(item)
        
    db.session.commit()
    return jsonify({"message": "Commande validée", "order_id": new_order.id}), 201

with app.app_context():
    db.create_all()
# --- ROUTE ADMIN ---
@app.route('/orders/all', methods=['GET'])
def get_all_orders():
    # Récupère toutes les commandes triées par date
    orders = Order.query.order_by(Order.date.desc()).all()
    return jsonify([o.to_dict() for o in orders])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004)