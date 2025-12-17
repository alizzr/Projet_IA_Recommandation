// URLs relatives pour nginx
const API_GATEWAY = "";

export async function fetchProducts() {
  const res = await fetch(`${API_GATEWAY}/api/products`);
  if (!res.ok) throw new Error("Erreur produits");
  return res.json();
}

export async function registerUser(payload) {
  const res = await fetch(`${API_GATEWAY}/api/users/register`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur inscription");
  return res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_GATEWAY}/api/users/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur connexion");
  return res.json();
}

export async function getCart(userId) {
    try {
        const res = await fetch(`${API_GATEWAY}/api/users/${userId}/cart`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
}

// --- CORRECTION MAJEURE ICI ---
export async function postCart(userId, product) {
  // On s'assure de récupérer un ID valide (soit id, soit product_id)
  const pid = product.id || product.product_id;
  
  if (!pid) {
      console.error("ERREUR CRITIQUE : Produit sans ID", product);
      throw new Error("Impossible d'ajouter ce produit (ID manquant)");
  }

  const payload = { 
      product_id: pid, 
      name: product.name, 
      price: product.price, 
      image: product.image 
  };

  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/cart`, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
      throw new Error("Erreur serveur lors de l'ajout au panier");
  }

  return res.json();
}

export async function deleteFromCart(userId, productId) {
    await fetch(`${API_GATEWAY}/api/users/${userId}/cart/${productId}`, { method: "DELETE" });
}

export async function getWishlist(userId) {
    try {
        const res = await fetch(`${API_GATEWAY}/api/users/${userId}/wishlist`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
}

export async function postWishlist(userId, product) {
  const pid = product.id || product.product_id; // Sécurisation aussi pour les favoris
  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/wishlist`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: pid, name: product.name, price: product.price, image: product.image }),
  });
  return res.json();
}

export async function deleteFromWishlist(userId, productId) {
    await fetch(`${API_GATEWAY}/api/users/${userId}/wishlist/${productId}`, { method: "DELETE" });
}