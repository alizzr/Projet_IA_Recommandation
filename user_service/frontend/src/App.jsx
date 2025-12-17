import React, { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import CartModal from "./components/CartModal";
import CheckoutModal from "./components/CheckoutModal";
import InvoiceModal from "./components/InvoiceModal";
import WishlistModal from "./components/WishlistModal";
import { getCart, getWishlist, deleteFromWishlist, deleteFromCart } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("techshop_user");
    if (savedUser) {
      try {
          const u = JSON.parse(savedUser);
          if (u && u.id) {
              setUser(u);
              loadData(u.id);
          } else {
              localStorage.removeItem("techshop_user");
              setAuthOpen(true);
          }
      } catch (e) {
          localStorage.removeItem("techshop_user");
      }
    } else {
      setAuthOpen(true);
    }
  }, []);

  const loadData = async (userId) => {
    if (!userId) return;
    try {
      const [c, w] = await Promise.all([getCart(userId), getWishlist(userId)]);
      setCart(c || []);
      setWishlist(w || []);
    } catch (e) { console.error("Erreur chargement données", e); }
  };

  const handleLoginSuccess = (response) => {
    const userData = response.user ? response.user : response;
    if (!userData || !userData.id) return;
    setUser(userData);
    localStorage.setItem("techshop_user", JSON.stringify(userData));
    loadData(userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem("techshop_user");
    setUser(null);
    setCart([]);
    setWishlist([]);
    window.location.href = "/"; 
  };

  const handleRemoveWishlist = async (productId) => {
      setWishlist(prev => prev.filter(p => p.product_id !== productId));
      if (user) await deleteFromWishlist(user.id, productId);
  };

  const handleRemoveCart = async (productId) => {
      setCart(prev => prev.filter(p => p.product_id !== productId));
      if (user) await deleteFromCart(user.id, productId);
  };

  const handleCheckoutSubmit = (deliveryData) => {
    const orderData = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        status: "Payé",
        delivery: deliveryData,
        items: cart
    };
    setLastOrder(orderData);
    setCheckoutOpen(false);
    setInvoiceOpen(true);
    setCart([]); 
  };

  const getUserName = () => {
      if (user && user.email) return user.email.split('@')[0];
      return "Client";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-2">
            🔐 Espace Client TechShop
          </div>
          <div>
            <a href="/" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm mr-2 no-underline">
              🔙 Retour Magasin
            </a>
            {user && (
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm">
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {!user ? (
          <div className="text-center mt-20">
            <h1 className="text-3xl font-bold mb-4">Bienvenue</h1>
            <button onClick={() => setAuthOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
              Se connecter / S'inscrire
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold mb-2">Bonjour, {getUserName()} 👋</h2>
              <p className="text-gray-500">ID Membre: #{user.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group" onClick={() => setCartOpen(true)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🛒</span>
                  <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold">{cart.length}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Mon Panier</h3>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group" onClick={() => setWishlistOpen(true)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform">❤️</span>
                  <span className="bg-pink-100 text-pink-800 py-1 px-3 rounded-full text-sm font-bold">{wishlist.length}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Mes Favoris</h3>
              </div>
            </div>
          </div>
        )}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} onRemove={handleRemoveCart} />
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} wishlist={wishlist} onRemove={handleRemoveWishlist} onAddToCart={() => {}} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} total={cart.reduce((sum, p) => sum + (Number(p.price) || 0), 0)} onSubmit={handleCheckoutSubmit} />
      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} order={lastOrder} />
    </div>
  );
}