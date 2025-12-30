from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import pickle
import xgboost as xgb
import numpy as np
import random

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, 'products.json')
MODEL_PATH = os.path.join(BASE_DIR, 'modele_final_70plus.pkl')

df_products = pd.DataFrame()
model = None

def init_app():
    global df_products, model
    if os.path.exists(JSON_PATH):
        try:
            df_products = pd.read_json(JSON_PATH)
            df_products.rename(columns={'product_id': 'id', 'image_url': 'image'}, inplace=True)
            if 'price' not in df_products.columns: df_products['price'] = 0.0
            if 'category' not in df_products.columns: df_products['category'] = 'Divers'
            if 'rating' not in df_products.columns: df_products['rating'] = 4.0
            df_products['price'] = pd.to_numeric(df_products['price'], errors='coerce').fillna(0)
            df_products['rating'] = pd.to_numeric(df_products['rating'], errors='coerce').fillna(4.0)
            print(f"✅ Catalogue chargé : {len(df_products)} produits.")
        except Exception as e:
            print(f"❌ Erreur JSON : {e}")

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            print("✅ Modèle IA chargé.")
        except: model = None

init_app()

# --- FONCTIONS ---
def get_boosted_categories(interactions):
    loved = set()
    try:
        items = interactions.get('cart', []) + interactions.get('wishlist', [])
        for item in items:
            p = df_products[df_products['id'] == item.get('product_id')]
            if not p.empty: loved.add(p.iloc[0]['category'])
    except: pass
    return loved

def predict_interest(user_profile, candidates, interactions):
    if model is None: return candidates
    try:
        X = pd.DataFrame()
        X['age'] = [int(user_profile.get('age', 25))] * len(candidates)
        X['gender'] = [1 if user_profile.get('gender') == 'Femme' else 0] * len(candidates)
        X['price'] = candidates['price'].values
        X['rating'] = candidates['rating'].values
        
        scores = model.predict(X)
        loved = get_boosted_categories(interactions)
        final_scores = [s * 1.5 if candidates.iloc[i]['category'] in loved else s for i, s in enumerate(scores)]
        
        candidates = candidates.copy()
        candidates['ai_score'] = final_scores
        return candidates.sort_values(by='ai_score', ascending=False)
    except: return candidates

@app.route('/get_amazon_blocks', methods=['POST'])
def get_amazon_blocks():
    try:
        if df_products.empty: return jsonify([])
        data = request.json or {}
        
        # ON RECUPERE L'ID UTILISATEUR
        user_id = data.get('user_id')
        
        profile = data.get('profile', {})
        interactions = data.get('interactions', {})
        
        blocks = []
        used_ids = set()

        # ====================================================
        # SCÉNARIO 1 : UTILISATEUR CONNECTÉ (MODE IA TOTAL)
        # ====================================================
        if user_id:
            # Bloc 1 : IA Pure
            candidates = df_products.sample(n=min(100, len(df_products)))
            ranked = predict_interest(profile, candidates, interactions)
            top = ranked.head(8).to_dict(orient='records')
            blocks.append({"title": f"🎯 Recommandé pour vous", "products": top})
            used_ids.update([p['id'] for p in top])

            # Bloc 2 : Cross-Selling (Panier)
            loved = get_boosted_categories(interactions)
            if loved:
                cat = list(loved)[0]
                cross = df_products[(df_products['category']==cat) & (~df_products['id'].isin(used_ids))].sample(n=min(4, len(df_products))).to_dict(orient='records')
                if cross: 
                    blocks.append({"title": f"👀 Parce que vous aimez : {cat}", "products": cross})
                    used_ids.update([p['id'] for p in cross])

        # ====================================================
        # SCÉNARIO 2 : VISITEUR (MODE VITRINE SÉDUCTION)
        # ====================================================
        else:
            # Bloc 1 : Les Best-Sellers (Valeurs sûres)
            best = df_products.sort_values(by='rating', ascending=False).head(20).sample(n=8).to_dict(orient='records')
            blocks.append({"title": "⭐ Les incontournables du moment", "products": best})
            used_ids.update([p['id'] for p in best])

            # Bloc 2 : Une catégorie au hasard pour donner des idées
            cats = list(df_products['category'].unique())
            if cats:
                random_cat = random.choice(cats)
                cat_prods = df_products[df_products['category'] == random_cat].sample(n=min(5, len(df_products))).to_dict(orient='records')
                blocks.append({"title": f"💡 Idée découverte : {random_cat}", "products": cat_prods})
                used_ids.update([p['id'] for p in cat_prods])

        # ====================================================
        # BLOCS COMMUNS (POUR TOUT LE MONDE)
        # ====================================================
        
        # Bloc : Promo / Petit Prix (Pour déclencher l'achat impulsif)
        cheap = df_products[(df_products['price'] < 50) & (~df_products['id'].isin(used_ids))]
        if not cheap.empty:
            cheap_sel = cheap.sample(n=min(5, len(cheap))).to_dict(orient='records')
            blocks.append({"title": "💸 Offres à saisir (Moins de 50€)", "products": cheap_sel})
            used_ids.update([p['id'] for p in cheap_sel])

        # Bloc : Tendances (Remplissage)
        remain = df_products[~df_products['id'].isin(used_ids)]
        if remain.empty: remain = df_products
        disc = remain.sample(n=min(8, len(remain))).to_dict(orient='records')
        blocks.append({"title": "🔥 Les pépites du catalogue", "products": disc})

        return jsonify(blocks)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify([])
@app.route('/stats', methods=['GET'])
def get_stats():
    status = "Inactif"
    if model: status = "Actif (XGBoost Loaded)"
    
    return jsonify({
        "products_count": len(df_products),
        "model_status": status,
        "api_version": "v2.1 Hybrid"
    })    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)