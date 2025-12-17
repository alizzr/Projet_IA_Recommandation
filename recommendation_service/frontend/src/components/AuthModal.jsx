import React, { useState } from "react";
// On importe les fonctions centralisées pour éviter les erreurs de port
import { loginUser, registerUser } from "../api";

export default function AuthModal({ open, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // Optionnel selon votre backend
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de page
    setError("");

    if (mode === "register" && pass !== confirmPass) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      let data;
      // On utilise api.js qui pointe vers le bon port (8003)
      if (mode === "login") {
        data = await loginUser({ email, password: pass });
      } else {
        data = await registerUser({ email, password: pass });
      }

      // Si on arrive ici, c'est que api.js n'a pas levé d'erreur
      onLoginSuccess(data); // data contient l'objet user complet avec ID
      onClose();
      
    } catch (err) {
      console.error("Erreur Auth", err);
      // Affiche le message d'erreur renvoyé par api.js
      setError(err.message || "Impossible de se connecter au serveur.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-center">
          {mode === "login" ? "Connexion" : "Inscription"}
        </h3>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet (Optionnel)"
              className="w-full border p-2 rounded mb-3"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full border p-2 rounded mb-3"
          />

          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Mot de passe"
            type="password"
            required
            className="w-full border p-2 rounded mb-3"
          />

          {mode === "register" && (
            <input
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirmer le mot de passe"
              type="password"
              required
              className="w-full border p-2 rounded mb-3"
            />
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-bold transition-colors"
          >
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setError("");
            }}
          >
            {mode === "login"
              ? "Pas de compte ? S'inscrire"
              : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
        
        <button onClick={onClose} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600">
          Fermer
        </button>
      </div>
    </div>
  );
}