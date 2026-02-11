// On pointe vers le Gateway
const API_GATEWAY = process.env.REACT_APP_API_URL || "";

// --- AUTH ---
export async function registerUser(payload) {
  const res = await fetch(`${API_GATEWAY}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur inscription");
  return res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_GATEWAY}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur connexion");
  return res.json();
}

// --- PANIER (DB) ---
export async function getCart(userId) {
  try {
    const res = await fetch(`${API_GATEWAY}/api/users/${userId}/cart`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
}

export async function postCart(userId, product) {
  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: product.id || product.product_id,
      name: product.name,
      price: product.price,
      image: product.image
    }),
  });
  if (!res.ok) throw new Error("Erreur ajout panier");
  return res.json();
}

export async function deleteFromCart(userId, productId) {
  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/cart/${productId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Erreur suppression panier");
  return res.json();
}

// --- FAVORIS / WISHLIST (DB) ---
export async function getWishlist(userId) {
  try {
    const res = await fetch(`${API_GATEWAY}/api/users/${userId}/wishlist`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
}

export async function postWishlist(userId, product) {
  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: product.id || product.product_id,
      name: product.name,
      price: product.price,
      image: product.image
    }),
  });
  if (!res.ok) throw new Error("Erreur ajout favoris");
  return res.json();
}

export async function deleteFromWishlist(userId, productId) {
  const res = await fetch(`${API_GATEWAY}/api/users/${userId}/wishlist/${productId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Erreur suppression favoris");
  return res.json();
}

// --- COMMANDES ---
export async function createOrder(userId, deliveryData) {
  const res = await fetch(`${API_GATEWAY}/api/users/orders/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deliveryData),
  });
  if (!res.ok) throw new Error("Erreur création commande");
  return res.json();
}
