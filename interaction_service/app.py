from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback_secret_key')

basedir = os.path.abspath(os.path.dirname(__file__))
# Dossier Data
data_dir = os.path.join(basedir, 'data')
os.makedirs(data_dir, exist_ok=True)

DB_USER = os.environ.get('POSTGRES_USER', 'postgres')
DB_PWD = os.environ.get('POSTGRES_PASSWORD', 'postgres')
DB_HOST = os.environ.get('DB_HOST', 'postgres')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('POSTGRES_DB', 'techshop_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PWD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
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
    def to_dict(self): 
        return {"product_id": self.product_id, "name": self.name, "price": self.price, "image": self.image}

class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    def to_dict(self): 
        return {"product_id": self.product_id, "name": self.name, "price": self.price, "image": self.image}

# --- NOUVEAUX MODÈLES COMMANDE (Pour garder l'historique) ---

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="Confirmée")
    # Relation pour accéder aux items de cette commande
    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total": self.total_price,
            "date": self.date.strftime("%Y-%m-%d %H:%M:%S"),
            "status": self.status,
            "items": [item.to_dict() for item in self.items] # On inclut les détails !
        }

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    qty = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {"name": self.name, "price": self.price, "qty": self.qty}

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
        product_id=data.get('product_id', data.get('id')),
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

@app.route('/wishlist/<int:user_id>', methods=['POST'])
def add_to_wishlist(user_id):
    data = request.json
    pid = data.get('product_id', data.get('id'))
    # Éviter les doublons
    exists = WishlistItem.query.filter_by(user_id=user_id, product_id=pid).first()
    if exists:
        return jsonify({"message": "Déjà en favoris"}), 200

    new_item = WishlistItem(
        user_id=user_id,
        product_id=pid,
        name=data['name'],
        price=data['price'],
        image=data.get('image')
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Ajouté aux favoris"})

@app.route('/wishlist/<int:user_id>/<int:product_id>', methods=['DELETE'])
def remove_from_wishlist(user_id, product_id):
    WishlistItem.query.filter_by(user_id=user_id, product_id=product_id).delete()
    db.session.commit()
    return jsonify({"message": "Retiré des favoris"})

# --- ROUTE PAIEMENT (Mise à jour pour sauvegarder l'historique) ---
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
    db.session.commit() # On commit pour avoir l'ID de la commande
    
    # 4. On archive les items du panier dans OrderItem
    for item in cart_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            name=item.name,
            price=item.price,
            qty=1
        )
        db.session.add(order_item)
        db.session.delete(item) # On retire du panier
        
    db.session.commit()
    return jsonify({"message": "Commande validée", "order_id": new_order.id}), 201

# --- ROUTE ADMIN ---
@app.route('/orders/all', methods=['GET'])
def get_all_orders():
    # Récupère toutes les commandes triées par date
    try:
        orders = Order.query.order_by(Order.date.desc()).all()
        return jsonify([o.to_dict() for o in orders])
    except Exception as e:
        print(f"Erreur order: {e}")
        return jsonify([])

# Initialisation de la BDD
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT_INTERACTION_SERVICE', 5004))
    app.run(host='0.0.0.0', port=port)