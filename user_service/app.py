from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))

# --- CONFIG DB ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

db = SQLAlchemy(app)

# --- MODELES ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    cart = db.relationship('CartItem', backref='user', lazy=True, cascade="all, delete-orphan")
    wishlist = db.relationship('WishlistItem', backref='user', lazy=True, cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='user', lazy=True)

    def to_dict(self):
        return {"id": self.id, "email": self.email}

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {"id": self.product_id, "product_id": self.product_id, "name": self.name, "price": self.price, "image": self.image}

class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {"id": self.product_id, "product_id": self.product_id, "name": self.name, "price": self.price, "image": self.image}

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="Validée") 
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.strftime("%Y-%m-%d %H:%M"),
            "total": self.total_price,
            "status": self.status,
            "delivery": { "address": self.address, "city": self.city, "phone": self.phone },
            "items": [i.to_dict() for i in self.items]
        }

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)

    def to_dict(self):
        return {"product_id": self.product_id, "name": self.name, "price": self.price}

with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email déjà utilisé"}), 400
    new_user = User(email=data['email'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Compte créé", "user": new_user.to_dict()}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if user: return jsonify(user.to_dict())
    return jsonify({"message": "Erreur login"}), 401

# --- ICI : J'AI RETIRÉ LE '/users' DEVANT LES URLS ---

@app.route('/<int:user_id>/cart', methods=['GET'])
def get_cart(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify([i.to_dict() for i in user.cart])

@app.route('/<int:user_id>/cart', methods=['POST'])
def add_to_cart(user_id):
    data = request.json
    existing = CartItem.query.filter_by(user_id=user_id, product_id=data['product_id']).first()
    if existing:
        return jsonify({"message": "Déjà au panier"}), 200
    new_item = CartItem(user_id=user_id, product_id=data['product_id'], name=data['name'], price=data['price'], image=data.get('image', ''))
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Ajouté"})

@app.route('/<int:user_id>/cart/<int:product_id>', methods=['DELETE'])
def remove_from_cart(user_id, product_id):
    item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if item:
        db.session.delete(item)
        db.session.commit()
    return jsonify({"message": "Supprimé"})

@app.route('/<int:user_id>/wishlist', methods=['GET'])
def get_wishlist(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify([i.to_dict() for i in user.wishlist])

@app.route('/<int:user_id>/wishlist', methods=['POST'])
def add_to_wishlist(user_id):
    data = request.json
    existing = WishlistItem.query.filter_by(user_id=user_id, product_id=data['product_id']).first()
    if existing:
        return jsonify({"message": "Déjà en favoris"}), 200
    new_item = WishlistItem(user_id=user_id, product_id=data['product_id'], name=data['name'], price=data['price'], image=data.get('image', ''))
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Ajouté"})

@app.route('/<int:user_id>/wishlist/<int:product_id>', methods=['DELETE'])
def remove_from_wishlist(user_id, product_id):
    item = WishlistItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if item:
        db.session.delete(item)
        db.session.commit()
    return jsonify({"message": "Supprimé"})

@app.route('/orders/<int:user_id>', methods=['POST'])
def create_order(user_id):
    # Pour les commandes, on laisse tel quel car l'URL est différente
    user = User.query.get(user_id)
    if not user or not user.cart: return jsonify({"message": "Erreur"}), 400
    data = request.get_json(force=True, silent=True) or {}
    total = sum(item.price for item in user.cart)
    new_order = Order(total_price=total, user_id=user_id, address=data.get('address',''), city=data.get('city',''), phone=data.get('phone',''))
    db.session.add(new_order)
    db.session.commit()
    for item in user.cart:
        db.session.add(OrderItem(product_id=item.product_id, name=item.name, price=item.price, order_id=new_order.id))
        db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Succès", "order": new_order.to_dict()}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)