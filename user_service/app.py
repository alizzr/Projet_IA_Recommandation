from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flasgger import Swagger
import os

app = Flask(__name__)
Swagger(app)
CORS(app)

# --- PERSISTANCE DES DONNÉES ---
basedir = os.path.abspath(os.path.dirname(__file__))
data_dir = os.path.join(basedir, 'data')
os.makedirs(data_dir, exist_ok=True)

# Configuration DB
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(data_dir, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- MODÈLE UTILISATEUR (Identité + Profil IA) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    
    # --- CHAMPS POUR L'IA ---
    age = db.Column(db.Integer, default=25)
    gender = db.Column(db.String(20), default="Mixte") 
    
    def to_dict(self):
        return {
            "id": self.id, 
            "email": self.email, 
            "is_admin": self.is_admin,
            "age": self.age,
            "gender": self.gender
        }

# --- ROUTES D'AUTHENTIFICATION ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Vérification doublon
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email déjà utilisé"}), 400
    
    # Création avec Age et Genre
    new_user = User(
        email=data['email'], 
        password=data['password'],
        age=data.get('age', 25),       # Valeur par défaut si vide
        gender=data.get('gender', 'Mixte') # Valeur par défaut si vide
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Compte créé", "user": new_user.to_dict()}), 201
    except Exception as e:
        return jsonify({"message": f"Erreur serveur: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    # CORRECTION : On compare le mot de passe brut (comme dans ton register)
    # Si plus tard tu veux du hash, il faudra changer register ET login
    if user and user.password == password:
        
        # LOGIQUE INTELLIGENTE : Conversion de la DB vers le Frontend
        # La DB connait "is_admin" (Booléen), le Frontend veut un "role" (Texte)
        user_role = "admin" if user.is_admin else "customer"

        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "email": user.email, # On renvoie l'email car 'name' n'existe pas dans ta DB
            "role": user_role    # <--- C'EST CA QUI ACTIVE LA REDIRECTION
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# --- INIT AUTOMATIQUE (Admin) ---
with app.app_context():
    db.create_all()
    # Création admin par défaut si inexistant
    if not User.query.filter_by(email='admin@techshop.com').first():
        admin = User(
            email='admin@techshop.com', 
            password='admin', 
            is_admin=True,
            age=99,
            gender="Robot"
        )
        db.session.add(admin)
        db.session.commit()

# --- ROUTE ADMIN ---
@app.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get(id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Utilisateur supprimé"})
    return jsonify({"message": "Introuvable"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)