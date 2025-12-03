import pandas as pd
import pickle
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# 1. Chargement des données
print("Chargement des données depuis products.csv...")
try:
    df = pd.read_csv('products.csv')
except FileNotFoundError:
    print("Erreur : Le fichier products.csv est introuvable !")
    exit()

# 2. Préparation des colonnes (Preprocessing)
# On définit quelles colonnes sont des chiffres et lesquelles sont du texte
numeric_features = ['price', 'design_rating', 'battery_rating']
categorical_features = ['category', 'brand', 'usage']

# On crée un "transformateur" qui va :
# - Mettre les chiffres entre 0 et 1 (MinMaxScaler)
# - Transformer le texte en colonnes de 0 et 1 (OneHotEncoder)
preprocessor = ColumnTransformer(
    transformers=[
        ('num', MinMaxScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# 3. Création du Pipeline (Le cerveau de l'IA)
# On combine le préprocessing et l'algorithme des "Plus Proches Voisins"
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', NearestNeighbors(n_neighbors=5, metric='cosine'))
])

# 4. Entraînement
print("Entraînement du modèle en cours...")
model.fit(df)

# 5. Sauvegarde en format Pickle (.pkl)
output_file = 'recommender_model.pkl'
print(f"Sauvegarde du modèle dans '{output_file}'...")
with open(output_file, 'wb') as f:
    pickle.dump(model, f)

print("✅ Succès ! Le fichier 'recommender_model.pkl' a été créé.")