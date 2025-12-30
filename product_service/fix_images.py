import json

# Configuration des images fixes et HD par mot-clé
IMAGE_MAP = {
    'Vacuum': 'https://images.unsplash.com/photo-1558317374-a309d9155da3?auto=format&fit=crop&w=500&q=80',  # Aspirateur
    'Novel': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80',   # Roman
    'Board': 'https://images.unsplash.com/photo-1610890716171-6b1c9f2c9f1a?auto=format&fit=crop&w=500&q=80',   # Jeu de société
    'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80', # Casque
    'Jeans': 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=500&q=80',   # Jeans
    'Doll': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',    # Poupée
    'Jacket': 'https://images.unsplash.com/photo-1551028919-ac66c9f80366?auto=format&fit=crop&w=500&q=80',   # Veste
    'Coffee': 'https://images.unsplash.com/photo-1520978285008-60d8e8055c65?auto=format&fit=crop&w=500&q=80',  # Machine café
    'Chair': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=500&q=80',   # Chaise
    'Biography': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80', # Biographie
    'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',   # Chaussures
    'Sci-Fi': 'https://images.unsplash.com/photo-1614726365723-49cfae9e0c67?auto=format&fit=crop&w=500&q=80',  # Science-fiction
    'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80', # Smartphone
    'Lamp': 'https://images.unsplash.com/photo-1507473883581-209633781b0b?auto=format&fit=crop&w=500&q=80',    # Lampe
    'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',  # PC Portable
    'Action': 'https://images.unsplash.com/photo-1608354580875-30bd4168b351?auto=format&fit=crop&w=500&q=80',  # Figurine
    'Tablet': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=500&q=80',   # Tablette
    'T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80',  # T-Shirt
    'Puzzle': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',  # Puzzle
    'Cookbook': 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=500&q=80' # Cuisine
}

DEFAULT_IMG = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=80"

def fix_products():
    try:
        # 1. Lire le fichier actuel
        with open('products.json', 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        print(f"✅ {len(products)} produits trouvés.")
        
        # 2. Remplacer les images
        count = 0
        for p in products:
            name = p.get('name', '')
            
            # Recherche du mot clé dans le nom du produit
            new_image = DEFAULT_IMG
            for keyword, url in IMAGE_MAP.items():
                if keyword in name:
                    new_image = url
                    break
            
            # Application de la nouvelle image
            p['image_url'] = new_image
            # On met aussi une fallback propre
            p['fallback_url'] = "https://via.placeholder.com/400x300?text=Image+Non+Disponible"
            count += 1

        # 3. Sauvegarder le résultat
        with open('products.json', 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
            
        print(f"✨ Succès ! {count} produits ont été mis à jour avec des images HD stables.")

    except FileNotFoundError:
        print("❌ Erreur : Le fichier 'products.json' est introuvable dans ce dossier.")
    except Exception as e:
        print(f"❌ Une erreur est survenue : {e}")

if __name__ == "__main__":
    fix_products()