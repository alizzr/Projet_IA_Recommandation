import React, { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import CartModal from "./components/CartModal";
import CheckoutModal from "./components/CheckoutModal";
import InvoiceModal from "./components/InvoiceModal";
import WishlistModal from "./components/WishlistModal";
import AdminDashboard from './pages/AdminDashboard'; // Import du dashboard
import { getCart, getWishlist, deleteFromWishlist, deleteFromCart } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  
  // États du site Client
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    const savedUser = localStorage.getItem("techshop_user");
    if (savedUser) {
      try {
          const u = JSON.parse(savedUser);
          if (u && u.id) {
              setUser(u);
              if (!u.is_admin) loadClientData(u.id); // On ne charge le panier que si c'est un client
          }
      } catch (e) { localStorage.removeItem("techshop_user"); }
    } else {
      setAuthOpen(true); // Ouvre le login direct si pas connecté
    }
  }, []);

  const loadClientData = async (userId) => {
    try {
      const [c, w] = await Promise.all([getCart(userId), getWishlist(userId)]);
      setCart(c || []);
      setWishlist(w || []);
    } catch (e) { console.error("Erreur data", e); }
  };

  // --- GESTION CONNEXION / DECONNEXION ---
  const handleLoginSuccess = (response) => {
    const userData = response.user ? response.user : response;
    setUser(userData);
    localStorage.setItem("techshop_user", JSON.stringify(userData));
    if (!userData.is_admin) loadClientData(userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem("techshop_user");
    setUser(null);
    setCart([]);
    setWishlist([]);
    setAuthOpen(true); // Retour case départ
  };

  // --- FONCTIONS CLIENT (Panier, Wishlist...) ---
  const handleRemoveWishlist = async (pid) => { setWishlist(p => p.filter(x => x.product_id !== pid)); if(user) await deleteFromWishlist(user.id, pid); };
  const handleRemoveCart = async (pid) => { setCart(p => p.filter(x => x.product_id !== pid)); if(user) await deleteFromCart(user.id, pid); };
  const handleCheckout = (data) => {
    setLastOrder({ id: Date.now(), date: new Date().toLocaleDateString(), status: "Payé", delivery: data, items: cart });
    setCheckoutOpen(false); setInvoiceOpen(true); setCart([]);
  };

  // =========================================================
  // 🚦 LE GRAND AIGUILLAGE
  // =========================================================

  // 1. CAS ADMIN : On retourne UNIQUEMENT le Dashboard
  if (user && user.is_admin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // 2. CAS CLIENT / VISITEUR : On retourne le site normal
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">🛍️ TechShop</div>
          <div>
            {!user ? (
                <button onClick={() => setAuthOpen(true)} className="bg-blue-600 px-4 py-2 rounded font-bold">Connexion</button>
            ) : (
                <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded text-sm">Déconnexion ({user.email})</button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {!user ? (
          <div className="text-center mt-20">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Bienvenue sur TechShop</h1>
            <p className="mb-8 text-gray-600">Connectez-vous pour voir nos offres exclusives.</p>
            <button onClick={() => setAuthOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition transform hover:scale-105">
              Accéder à la boutique
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carte Panier */}
              <div onClick={() => setCartOpen(true)} className="bg-white p-8 rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">Mon Panier</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{cart.length} articles</span>
                </div>
              </div>
              {/* Carte Wishlist */}
              <div onClick={() => setWishlistOpen(true)} className="bg-white p-8 rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition border-l-4 border-pink-500">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">Mes Favoris</h3>
                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-bold">{wishlist.length} articles</span>
                </div>
              </div>
            </div>
            {/* Ici tu pourras remettre la liste des produits plus tard */}
          </div>
        )}
      </main>

      {/* Modales */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} onRemove={handleRemoveCart} />
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} wishlist={wishlist} onRemove={handleRemoveWishlist} onAddToCart={() => {}} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} total={cart.reduce((s, p) => s + (Number(p.price)||0), 0)} onSubmit={handleCheckout} />
      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} order={lastOrder} />
    </div>
  );
}