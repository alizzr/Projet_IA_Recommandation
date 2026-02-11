import React, { useState } from "react";

export default function Navbar({
  cartCount,
  wishlistCount,
  user,
  categories,
  onSearch,
  onCategoryClick,
  onSpecialFilter,
  onOpenCart,
  onOpenWishlist,
  onLogout
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const categoryIcons = {
    "Electronics": "💻",
    "Clothing": "👕",
    "Books": "📚",
    "Toys": "🧸",
    "Home": "🏠",
    "Furniture": "🪑",
  };

  return (
    <nav className="bg-[#131921] text-white sticky top-0 z-50 shadow-lg">
      {/* --- ETAGE 1 : RECHERCHE & COMPTE --- */}
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-4 justify-between h-[64px]">

        {/* LOGO */}
        <div onClick={() => { onSearch(""); setSelectedCat("all"); }} className="flex items-center gap-1.5 cursor-pointer hover:ring-1 hover:ring-white p-1.5 rounded transition-all flex-shrink-0">
          <div className="bg-gradient-to-br from-[#febd69] to-[#f0a030] rounded-lg w-8 h-8 flex items-center justify-center">
            <span className="text-[#131921] font-black text-sm">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">Tech<span className="text-[#febd69]">Shop</span></span>
        </div>

        {/* RECHERCHE */}
        <form onSubmit={handleSearchSubmit} className="flex-1 hidden md:flex h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#febd69] transition-all">
          <select
            className="bg-gray-100 text-gray-700 text-xs px-3 border-r border-gray-300 outline-none cursor-pointer hover:bg-gray-200 max-w-[140px] font-medium"
            onChange={(e) => {
              if (e.target.value) {
                onCategoryClick(e.target.value);
                setSelectedCat(e.target.value);
              }
            }}
          >
            <option value="">Toutes catégories</option>
            {categories && categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 px-4 text-black outline-none text-sm"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-5 text-gray-900 font-bold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 sm:gap-3 text-sm">

          {/* COMPTE */}
          {user ? (
            <div className="flex flex-col leading-tight cursor-pointer hover:ring-1 hover:ring-white p-2 rounded transition-all">
              <span className="text-[10px] text-gray-400">Bonjour</span>
              <span className="font-bold text-sm">{user.email.split('@')[0]}</span>
              <span onClick={onLogout} className="text-[10px] text-red-300 hover:text-red-100 hover:underline">Déconnexion</span>
            </div>
          ) : (
            <a href="/auth" className="flex flex-col leading-tight cursor-pointer hover:ring-1 hover:ring-white p-2 rounded transition-all text-white no-underline">
              <span className="text-[10px] text-gray-400">Bonjour</span>
              <span className="font-bold text-sm">Se connecter</span>
            </a>
          )}

          {/* FAVORIS */}
          <div onClick={onOpenWishlist} className="cursor-pointer hover:ring-1 hover:ring-white p-2 rounded transition-all text-center relative">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#febd69] text-[#131921] font-bold text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
            <span className="text-[10px] hidden sm:block">Favoris</span>
          </div>

          {/* PANIER */}
          <div onClick={onOpenCart} className="flex items-end gap-1 cursor-pointer hover:ring-1 hover:ring-white p-2 rounded transition-all relative">
            <div className="relative">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            </div>
            <span className="font-bold hidden sm:block text-sm mb-0.5">Panier</span>
          </div>
        </div>
      </div>

      {/* --- ETAGE 2 : CATEGORIES --- */}
      <div className="bg-[#232f3e] text-white text-sm py-1.5 px-4">
        <div className="max-w-[1600px] mx-auto flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide items-center">
          <span
            onClick={() => { onSearch(""); setSelectedCat("all"); }}
            className={`font-bold flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full transition-all text-xs ${selectedCat === "all" ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            ☰ Tous
          </span>

          <span className="border-l border-gray-600 h-5 mx-1"></span>

          <span onClick={() => onSpecialFilter('best_sellers')} className="cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-all text-xs font-medium">⭐ Meilleures ventes</span>
          <span onClick={() => onSpecialFilter('new')} className="cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-all text-xs font-medium">🆕 Nouveautés</span>
          <span onClick={() => onSpecialFilter('flash')} className="cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-all text-xs text-[#febd69] font-bold">⚡ Ventes Flash</span>

          <span className="border-l border-gray-600 h-5 mx-1"></span>

          {categories && categories.map((cat) => (
            <span
              key={cat}
              onClick={() => { onCategoryClick(cat); setSelectedCat(cat); }}
              className={`cursor-pointer px-3 py-1.5 rounded-full transition-all text-xs font-medium ${selectedCat === cat ? "bg-white/15 text-white" : "hover:bg-white/10 text-gray-300"}`}
            >
              {categoryIcons[cat] || "📦"} {cat}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}