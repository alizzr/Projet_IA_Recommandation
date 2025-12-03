import requests
import json

# L'URL de votre API locale
url = 'http://localhost:5001/recommend'

# Les données de l'utilisateur (Le profil simulé)
payload = {
    "category": "Laptop",
    "price": 800,
    "brand": "Dell",
    "usage": "Bureautique",
    "design_rating": 3,
    "battery_rating": 5
}

print(f"Envoi de la demande à {url}...")
print(f"Données envoyées : {payload}")

try:
    # Envoi de la requête POST
    response = requests.post(url, json=payload)

    # Vérification du résultat
    if response.status_code == 200:
        print("\n✅ Réponse reçue avec succès ! Voici les recommandations :")
        recommendations = response.json()
        for i, product in enumerate(recommendations, 1):
            print(f"{i}. {product['name']} ({product['price']}€) - {product['usage']}")
    else:
        print(f"\n❌ Erreur : {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"\n❌ Impossible de contacter le serveur. Vérifiez que app.py tourne bien dans un autre terminal.\nErreur: {e}")