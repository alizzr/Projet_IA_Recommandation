#!/usr/bin/env python3
import requests
import json
import time

def create_admin_account():
    print("🚀 Création du compte administrateur...")

    # Données de l'admin
    admin_email = "admin@techshop.com"
    admin_password = "admin123"

    try:
        # 1. Créer le compte
        print("📝 Inscription de l'admin...")
        register_url = "http://localhost:5003/register"
        register_data = {
            "email": admin_email,
            "password": admin_password
        }

        register_response = requests.post(register_url, json=register_data, timeout=10)
        print(f"Réponse inscription: {register_response.status_code}")
        print(f"Contenu: {register_response.text}")

        if register_response.status_code != 201:
            print("❌ Échec de l'inscription")
            return False

        # Attendre un peu
        time.sleep(1)

        # 2. Se connecter pour récupérer l'ID utilisateur
        print("🔐 Connexion pour récupérer l'ID...")
        login_url = "http://localhost:5003/login"
        login_data = {
            "email": admin_email,
            "password": admin_password
        }

        login_response = requests.post(login_url, json=login_data, timeout=10)
        print(f"Réponse connexion: {login_response.status_code}")
        print(f"Contenu: {login_response.text}")

        if login_response.status_code != 200:
            print("❌ Échec de la connexion")
            return False

        user_data = login_response.json()
        user_id = user_data.get('id')

        if not user_id:
            print("❌ ID utilisateur non trouvé")
            return False

        print(f"✅ Utilisateur créé avec ID: {user_id}")

        # 3. Mettre à jour les droits admin
        print("👑 Attribution des droits administrateur...")
        update_url = f"http://localhost:5003/admin/users/{user_id}"
        update_data = {
            "is_admin": True
        }

        update_response = requests.put(update_url, json=update_data, timeout=10)
        print(f"Réponse mise à jour admin: {update_response.status_code}")
        print(f"Contenu: {update_response.text}")

        if update_response.status_code == 200:
            print("✅ Compte administrateur créé avec succès!")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Mot de passe: {admin_password}")
            print("\n🎯 Pour tester:")
            print("1. Allez sur http://localhost")
            print("2. Cliquez sur '🔐 Espace Client TechShop'")
            print("3. Connectez-vous avec les identifiants ci-dessus")
            print("4. Vous devriez voir les boutons admin")
            return True
        else:
            print("❌ Échec de la mise à jour des droits admin")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        print("💡 Vérifiez que les services Docker sont démarrés:")
        print("   docker ps")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

if __name__ == "__main__":
    success = create_admin_account()
    if not success:
        print("\n🔧 Alternatives:")
        print("1. Utilisez l'interface web pour créer un compte normal")
        print("2. Puis utilisez une requête API pour le rendre admin")
        print("3. Ou contactez-moi pour du débogage supplémentaire")
