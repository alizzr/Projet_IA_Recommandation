import React, { useState } from "react";
// On importe les fonctions centralisées pour éviter les erreurs de port
import { loginUser, registerUser } from "../api";

export default function AuthModal({ open, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  // --- CHAMPS POUR L'IA ---
  const [age, setAge] = useState("25"); 
  const [gender, setGender] = useState("Homme"); 

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);

    // Vérification basique
    if (mode === "register" && pass !== confirmPass) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      let data;
      
      if (mode === "login") {
        // Connexion simple
        data = await loginUser({ email, password: pass });
      } else {
        // Inscription AVEC données IA
        data = await registerUser({ 
            email, 
            password: pass,
            age: parseInt(age), 
            gender: gender
        });
      }

      // --- MODIFICATION ICI : LOGIQUE DE REDIRECTION ADMIN ---
      // Si le backend nous dit que c'est un admin, on redirige vers le Dashboard
      if (data.role === "admin") {
          window.location.href = "http://localhost:8081";
          return; // On arrête l'exécution ici pour laisser la page changer
      }
      // -------------------------------------------------------

      // Succès Client (Comportement normal)
      onLoginSuccess(data); 
      onClose();
      
    } catch (err) {
      console.error("Erreur Auth", err);
      setError(err.message || "Impossible de se connecter au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl transform transition-all">
        
        {/* Header */}
        <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">
          {mode === "login" ? "Bon retour 👋" : "Créer un profil IA 🚀"}
        </h3>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {mode === "login" 
            ? "Connectez-vous pour voir vos recommandations" 
            : "Remplissez votre profil pour que l'IA vous connaisse"}
        </p>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* CHAMPS SPÉCIFIQUES INSCRIPTION (IA) */}
          {mode === "register" && (
            <div className="animate-fade-in space-y-4">
                
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation</label>
                <input
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  type="password"
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre Âge</label>
                  <input
                    type="number"
                    min="10"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre Genre</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic text-center">
                Ces infos servent uniquement à personnaliser les produits.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"}`}
          >
            {loading ? "Chargement..." : (mode === "login" ? "Se connecter" : "S'inscrire")}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          <button
            className="text-blue-600 font-bold hover:underline"
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setError("");
            }}
          >
            {mode === "login"
              ? "Pas de compte ? Créer un profil"
              : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          ✕
        </button>
      </div>
    </div>
  );
}