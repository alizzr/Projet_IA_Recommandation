import React, { useState } from "react";

// On définit l'URL de l'API User (via Nginx)
const API_URL = "/api/users"; 

export default function App() {
  const [mode, setMode] = useState("login"); // 'login' ou 'register'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Champs Formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NOUVEAU CHAMP
  
  // Champs IA (Inscription uniquement)
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("Homme"); // Par défaut Homme (puisque Mixte est retiré)

  // --- GESTION DU LOGIN / REGISTER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- 1. VÉRIFICATION MOT DE PASSE (Seulement pour l'inscription) ---
    if (mode === "register") {
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }
    }

    const endpoint = mode === "login" ? `${API_URL}/login` : `${API_URL}/register`;
    
    // Préparation des données
    const payload = { email, password };
    if (mode === "register") {
        payload.age = parseInt(age);
        payload.gender = gender;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // --- SUCCÈS ---
        if (mode === "register") {
            alert("Compte créé avec succès ! Connectez-vous.");
            setMode("login");
            setLoading(false);
            return;
        }

        // --- LOGIN & REDIRECTION ---
        // On utilise bien la clé "techshop_user" pour que le magasin le reconnaisse
        localStorage.setItem("techshop_user", JSON.stringify(data)); 

        if (data.role === "admin" || data.is_admin) {
            window.location.href = "http://localhost:8081"; // Dashboard Admin
        } else {
            window.location.href = "/"; // Magasin
        }

      } else {
        setError(data.message || data.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de joindre le serveur d'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        {/* EN-TÊTE */}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
                {mode === "login" ? "Connexion TechShop" : "Créer un profil IA"}
            </h1>
            <p className="text-gray-500 text-sm">
                {mode === "login" 
                    ? "Accédez à votre espace personnalisé" 
                    : "Laissez l'IA trouver vos produits préférés"}
            </p>
        </div>

        {/* ERREUR */}
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm border border-red-200">
                ⚠️ {error}
            </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                    type="email" required 
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                />
            </div>

            {/* Mot de passe */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input 
                    type="password" required 
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                />
            </div>

            {/* CHAMPS EXCLUSIFS INSCRIPTION */}
            {mode === "register" && (
                <div className="animate-fade-in space-y-4">
                    
                    {/* Confirmation Mot de passe (NOUVEAU) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                        <input 
                            type="password" required 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                            <input 
                                type="number" min="10" max="99" required
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={age} onChange={e => setAge(e.target.value)}
                            />
                        </div>
                        {/* Genre (MIXTE RETIRÉ) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                            <select 
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={gender} onChange={e => setGender(e.target.value)}
                            >
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-md mt-4"
            >
                {loading ? "Chargement..." : (mode === "login" ? "Se connecter" : "S'inscrire")}
            </button>
        </form>

        {/* PIED DE PAGE (Switch Login/Register) */}
        <div className="mt-6 text-center border-t pt-4">
            <button 
                onClick={() => { 
                    setMode(mode === "login" ? "register" : "login"); 
                    setError(""); 
                    setConfirmPassword(""); // On vide la confirmation quand on change de mode
                }}
                className="text-blue-600 font-medium hover:underline text-sm"
            >
                {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
        </div>
        
        <div className="mt-2 text-center">
             <a href="/" className="text-gray-400 text-xs hover:text-gray-600">← Retour au magasin</a>
        </div>

      </div>
    </div>
  );
}