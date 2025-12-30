import pandas as pd
import xgboost as xgb
import pickle
import os
import random

# Chemins
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, 'products.json')
MODEL_PATH = os.path.join(BASE_DIR, 'modele_final_70plus.pkl')

print("⏳ Démarrage de l'entraînement...")

# 1. Chargement des produits
df = pd.read_json(JSON_PATH)
# Nettoyage
if 'price' not in df.columns: df['price'] = 0.0
if 'rating' not in df.columns: df['rating'] = 4.0
if 'category' not in df.columns: df['category'] = 'Divers'
df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(4.0)

# 2. Génération de données d'entraînement simulées (Logique Métier)
# On crée 1000 exemples d'utilisateurs virtuels pour apprendre au modèle
data = []
for _ in range(1000):
    # Profil aléatoire
    age = random.randint(18, 80)
    gender = random.choice([0, 1]) # 0=Homme, 1=Femme
    
    # On prend un produit au hasard
    product = df.sample(1).iloc[0]
    
    # LOGIQUE DE VÉRITÉ (Ce que l'IA doit apprendre)
    score = 0.5 # Neutre
    
    # Règle 1 : Les jeunes aiment l'électronique
    if age < 30 and product['category'] == 'Electronics': score += 0.4
    
    # Règle 2 : Les femmes aiment statistiquement plus "Beauty" (Exemple data)
    if gender == 1 and product['category'] == 'Beauty': score += 0.4
    
    # Règle 3 : Tout le monde aime les produits bien notés
    if product['rating'] > 4.5: score += 0.2
    
    # Règle 4 : Le prix rebute les jeunes
    if age < 25 and product['price'] > 100: score -= 0.3

    # On borne entre 0 et 1
    score = max(0, min(1, score))
    
    data.append({
        'age': age,
        'gender': gender,
        'price': product['price'],
        'rating': product['rating'],
        'target': score
    })

# Création du DataFrame d'entraînement
train_df = pd.DataFrame(data)
X = train_df[['age', 'gender', 'price', 'rating']]
y = train_df['target']

# 3. Entraînement XGBoost
model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=50)
model.fit(X, y)

# 4. Sauvegarde
with open(MODEL_PATH, 'wb') as f:
    pickle.dump(model, f)

print(f"✅ Modèle régénéré et sauvegardé ici : {MODEL_PATH}")
print("🚀 Vous pouvez maintenant redémarrer le service !")