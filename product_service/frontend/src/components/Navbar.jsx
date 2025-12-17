import React from "react";

export default function Navbar({ cartCount, wishlistCount, user, onOpenCart, onOpenWishlist, onSearch, onLogout }) {
  return (
    <nav className="bg-yellow-500 text-black p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">🛍️ TechShop</div>

        <div className="flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
        </div>

        <div className="flex items-center gap-4">
          <a href="/advisor" className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm no-underline">
            🧠 IA
          </a>
          {user ? (
            <>
              <span className="text-sm">Bonjour, {user.email.split('@')[0]}</span>
              <button onClick={onOpenWishlist} className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded text-sm">
                ❤️ {wishlistCount}
              </button>
              <button onClick={onOpenCart} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                🛒 {cartCount}
              </button>
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <button onClick={onOpenCart} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              🛒 {cartCount}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
