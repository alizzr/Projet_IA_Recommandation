import pandas as pd
import pickle
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# ============================================
# 1. Chargement du dataset
# ============================================
print("📥 Chargement de products.csv...")
try:
    df = pd.read_csv("products.csv")
    print("✔️ Dataset chargé avec", len(df), "produits.")
except:
    print("❌ ERREUR : products.csv introuvable.")
    exit()

# ============================================
# 2. Sélection des colonnes
# ============================================
numeric_features = ["price", "design_rating", "battery_rating"]
categorical_features = ["category", "brand", "usage"]

all_features = numeric_features + categorical_features

# ============================================
# 3. Preprocessing
# ============================================
preprocessor = ColumnTransformer(
    transformers=[
        ("num", MinMaxScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ]
)

# ============================================
# 4. Pipeline IA (preprocessing + nearest neighbors)
# ============================================
model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("nn", NearestNeighbors(n_neighbors=5, metric="cosine"))
])

# ============================================
# 5. Entraînement du modèle
# ============================================
print("⚙️ Transformation des données...")
X = preprocessor.fit_transform(df[all_features])

print("🤖 Entraînement du modèle NearestNeighbors...")
model.named_steps["nn"].fit(X)

# ============================================
# 6. Sauvegarde dans un fichier .pkl
# ============================================
model_data = {
    "df": df,                     # dataset original
    "preprocessor": preprocessor, # transformateur
    "model": model.named_steps["nn"],  # modèle KNN
    "features": all_features
}

output_file = "recommender_model.pkl"
with open(output_file, "wb") as f:
    pickle.dump(model_data, f)

print("✅ Modèle sauvegardé dans:", output_file)
print("🎉 Entraînement terminé avec succès !")
