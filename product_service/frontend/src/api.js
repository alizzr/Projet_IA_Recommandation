// --- CONFIGURATION DES PORTS (Via Nginx) ---
const BASE_URL = process.env.REACT_APP_API_URL || "";
const API_PRODUCT = `${BASE_URL}/api/products`;      // Catalogue
const API_USER = `${BASE_URL}/api/users`;         // Auth (Login/Register)
const API_INTERACTION = `${BASE_URL}/api/interactions`;  // Panier & Favoris


// --- PRODUITS ---
export async function fetchProducts() {
  const res = await fetch(API_PRODUCT);
  if (!res.ok) throw new Error("Erreur produits");
  return res.json();
}

// --- AUTHENTIFICATION (Service User) ---
export async function registerUser(payload) {
  const res = await fetch(`${API_USER}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur inscription");
  return res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_USER}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur connexion");
  return res.json();
}

// --- PANIER (Service Interaction) ---
// CORRECTION : On pointe vers API_INTERACTION
export async function getCart(userId) {
  try {
    const res = await fetch(`${API_INTERACTION}/cart/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { return []; }
}

export async function postCart(userId, product) {
  // Sécurisation de l'ID produit
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

  // CORRECTION : Envoi vers Interaction Service
  const res = await fetch(`${API_INTERACTION}/cart/${userId}`, {
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
  await fetch(`${API_INTERACTION}/cart/${userId}/${productId}`, { method: "DELETE" });
}

// --- FAVORIS (Service Interaction) ---
// CORRECTION : On pointe vers API_INTERACTION
export async function getWishlist(userId) {
  try {
    const res = await fetch(`${API_INTERACTION}/wishlist/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { return []; }
}

export async function postWishlist(userId, product) {
  const pid = product.id || product.product_id;
  const res = await fetch(`${API_INTERACTION}/wishlist/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: pid,
      name: product.name,
      price: product.price,
      image: product.image
    }),
  });
  return res.json();
}

export async function deleteFromWishlist(userId, productId) {
  await fetch(`${API_INTERACTION}/wishlist/${userId}/${productId}`, { method: "DELETE" });
}