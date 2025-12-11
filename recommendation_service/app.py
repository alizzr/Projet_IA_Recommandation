from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import os
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Chemins
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'products.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'recommender_model.pkl')

# Chargement Données
print("⏳ Chargement du Service IA...")
if os.path.exists(CSV_PATH):
    df = pd.read_csv(CSV_PATH)
    print(f"✅ Catalogue chargé : {len(df)} produits.")
else:
    print("❌ ERREUR: products.csv manquant.")
    df = pd.DataFrame()

# Chargement Modèle (Le Cerveau)
model_data = None
if os.path.exists(MODEL_PATH):
    try:
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
        print("✅ Cerveau IA (.pkl) chargé avec succès.")
    except Exception as e:
        print(f"⚠️ Erreur chargement .pkl: {e}")
else:
    print("⚠️ Pas de fichier .pkl (L'IA sera désactivée).")

@app.route('/recommend_by_questions', methods=['POST'])
def recommend():
    try:
        user_input = request.json
        print(f"🧠 Demande reçue : {user_input}")

        # --- TENTATIVE 1 : VRAIE IA (Machine Learning) ---
        if model_data and not df.empty:
            try:
                print("🤖 Tentative utilisation Modèle IA...")
                
                # 1. On récupère les outils du modèle
                # (Note: dépend de comment vous avez sauvegardé dans train_model.py)
                # Si c'est un pipeline direct :
                pipeline = model_data 
                
                # 2. On prépare la donnée utilisateur comme une ligne de tableau
                input_df = pd.DataFrame([user_input])
                
                # AJOUT CRITIQUE : Compléter les colonnes manquantes pour scikit-learn
                # L'IA a besoin d'avoir EXACTEMENT les mêmes colonnes qu'à l'entraînement
                for col in ['category', 'price', 'brand', 'usage', 'design_rating', 'battery_rating']:
                    if col not in input_df.columns:
                        input_df[col] = 0 if 'rating' in col or 'price' in col else 'Autre'

                # 3. Transformation mathématique (Texte -> Chiffres)
                # Si votre pkl est un Pipeline, il a une étape 'preprocessor'
                if hasattr(pipeline, 'named_steps'):
                    preprocessor = pipeline.named_steps['preprocessor']
                    knn = pipeline.named_steps['classifier']
                    
                    # Transformation
                    user_vector = preprocessor.transform(input_df)
                    
                    # 4. Calcul des voisins (La vraie IA est ICI)
                    distances, indices = knn.kneighbors(user_vector, n_neighbors=5)
                    
                    # Récupération
                    results = df.iloc[indices[0]].to_dict(orient='records')
                    print(f"✨ Succès IA : {len(results)} produits trouvés par similarité.")
                    return jsonify(results)
                    
            except Exception as ml_error:
                print(f"⚠️ L'IA a échoué ({ml_error}), passage au filtrage classique.")

        # --- TENTATIVE 2 : FILTRAGE CLASSIQUE (Secours) ---
        # Si l'IA n'est pas là ou a planté, on utilise la logique "Cerveau Humain"
        print("🔧 Utilisation du Filtrage Logique (Fallback).")
        candidates = df.copy()
        
        target_cat = user_input.get('category')
        target_price = float(user_input.get('price', 0))

        if target_cat and target_cat != "Peu importe":
            candidates = candidates[candidates['category'].str.lower() == target_cat.lower()]
            if candidates.empty: candidates = df.copy() # Si trop strict, on annule

        # Tri par prix
        candidates['diff'] = abs(candidates['price'] - target_price)
        results = candidates.sort_values('diff').head(5).drop(columns=['diff']).to_dict(orient='records')
        
        return jsonify(results)

    except Exception as e:
        print(f"🔥 Erreur critique : {e}")
        print(traceback.format_exc())
        # Ultime secours
        return jsonify(df.sample(3).to_dict(orient='records'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)