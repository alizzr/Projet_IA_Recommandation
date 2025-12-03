import pandas as pd
import random

# Configuration des données possibles
categories = ['Smartphone', 'Laptop']
brands_smartphone = ['Apple', 'Samsung', 'Google', 'Xiaomi']
brands_laptop = ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus']
usages = ['Gaming', 'Bureautique', 'Photo_Video', 'Basique']

data = []

# On génère 100 produits fictifs
for i in range(1, 101):
    product_id = i
    category = random.choice(categories)
    
    # Logique pour la marque et le prix selon la catégorie
    if category == 'Smartphone':
        brand = random.choice(brands_smartphone)
        # Prix entre 200 et 1500
        price = random.randint(200, 1500)
        # Batterie importante pour les téléphones
        battery_rating = random.randint(3, 5) 
        # Design souvent important
        design_rating = random.randint(3, 5)
        
    else: # Laptop
        brand = random.choice(brands_laptop)
        # Prix entre 400 et 3000
        price = random.randint(400, 3000)
        battery_rating = random.randint(2, 5)
        design_rating = random.randint(2, 5)

    # Attribution d'un usage principal
    usage = random.choice(usages)
    
    # Ajustements logiques (ex: Gaming = cher et performant)
    if usage == 'Gaming':
        price = max(price, 1200) # Minimum 1200 pour du gaming
        design_rating = random.randint(4, 5) # Souvent RGB / Look agressif
    
    # Nom du produit (Fictif)
    model_name = f"{brand} {category} {random.choice(['X', 'Pro', 'Air', 'Ultra', 'Lite'])} {random.randint(10, 20)}"

    data.append([product_id, model_name, category, price, brand, usage, design_rating, battery_rating])

# Création du DataFrame
df = pd.DataFrame(data, columns=['product_id', 'name', 'category', 'price', 'brand', 'usage', 'design_rating', 'battery_rating'])

# Sauvegarde en CSV
df.to_csv('products.csv', index=False)

print("✅ Fichier 'products.csv' généré avec succès avec 100 produits !")
print(df.head()) # Affiche les 5 premières lignes pour vérifier