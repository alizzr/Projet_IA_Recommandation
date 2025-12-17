// On pointe vers le Gateway Nginx
const API_GATEWAY = "http://localhost"; 

// --- Service IA (via /api/ai/) ---

export async function requestRecommendations(formData) {
  // L'URL traverse le Gateway -> Nginx -> Service IA
  const res = await fetch(`${API_GATEWAY}/api/ai/recommend_by_questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error("Erreur recommandation IA");
  return res.json();
}

// Fonction pour ajouter un produit recommandé au panier (Service User)
export async function postCart(userId, product) {
  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Erreur ajout panier");
  return res.json();
}