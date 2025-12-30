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
    // onLogin n'est plus utilisé car on a un lien direct
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    onSearch(searchTerm);
  };

  return (
    <nav className="bg-[#131921] text-white sticky top-0 z-50 shadow-md">
      {/* --- ETAGE 1 : RECHERCHE & COMPTE --- */}
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-4 justify-between h-16">
        
        {/* LOGO */}
        <div onClick={() => onSearch("")} className="flex items-center gap-1 cursor-pointer hover:border hover:border-white p-1 rounded">
          <span className="text-2xl font-bold tracking-tighter">Tech<span className="text-[#febd69]">Shop</span></span>
        </div>

        {/* RECHERCHE ACTIVE */}
        <form onSubmit={handleSearchSubmit} className="flex-1 hidden md:flex h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#febd69]">
          <select className="bg-gray-100 text-gray-700 text-xs px-2 border-r border-gray-300 outline-none cursor-pointer hover:bg-gray-200 max-w-[150px]">
            <option value="">Toutes</option>
            {categories && categories.slice(0, 5).map(cat => (
                <option key={cat}>{cat}</option>
            ))}
          </select>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher TechShop..." 
            className="flex-1 px-4 text-black outline-none"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-5 text-gray-900 text-xl font-bold transition-colors">
            🔍
          </button>
        </form>

        {/* ACTIONS */}
        <div className="flex items-center gap-4 text-sm">
          
          {/* ZONE COMPTE : Logique conditionnelle PROPRE */}
          {user ? (
              // CAS 1 : CONNECTÉ (Div interactif avec Logout)
              <div className="flex flex-col leading-tight cursor-pointer hover:border hover:border-white p-1 rounded">
                <span className="text-xs text-gray-300">Bonjour, {user.email.split('@')[0]}</span>
                <span className="font-bold">Mon Compte</span>
                <span onClick={onLogout} className="text-[10px] text-red-300 hover:text-red-100 hover:underline">Déconnexion</span>
              </div>
          ) : (
              // CAS 2 : INVITÉ (Vrai lien HTML vers /auth)
              <a href="/auth" className="flex flex-col leading-tight cursor-pointer hover:border hover:border-white p-1 rounded text-white no-underline">
                <span className="text-xs text-gray-300">Bonjour, Identifiez-vous</span>
                <span className="font-bold">Se connecter</span>
              </a>
          )}

          {/* FAVORIS */}
          <div onClick={onOpenWishlist} className="cursor-pointer hover:border hover:border-white p-2 rounded text-center">
              <span className="text-xs font-bold block">Favoris</span>
              <span className="font-bold">{wishlistCount}</span>
          </div>

          {/* PANIER */}
          <div onClick={onOpenCart} className="flex items-end gap-1 cursor-pointer hover:border hover:border-white p-2 rounded">
            <div className="relative">
               <span className="text-3xl">🛒</span>
               <span className="absolute -top-1 left-3 bg-[#febd69] text-black font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full">
                 {cartCount}
               </span>
            </div>
            <span className="font-bold hidden sm:block mb-1">Panier</span>
          </div>
        </div>
      </div>
      
      {/* --- ETAGE 2 : CATEGORIES DYNAMIQUES --- */}
      <div className="bg-[#232f3e] text-white text-sm py-2 px-4 flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <span onClick={() => onSearch("")} className="font-bold flex items-center gap-1 cursor-pointer hover:text-[#febd69]">
          ☰ Tout
        </span>
        
        {/* Liens Spéciaux */}
        <span onClick={() => onSpecialFilter('best_sellers')} className="cursor-pointer hover:border hover:border-white px-1 border border-transparent transition-all">Meilleures ventes</span>
        <span onClick={() => onSpecialFilter('new')} className="cursor-pointer hover:border hover:border-white px-1 border border-transparent transition-all">Nouveautés</span>
        <span onClick={() => onSpecialFilter('flash')} className="cursor-pointer hover:border hover:border-white px-1 border border-transparent transition-all">Ventes Flash</span>

        {/* Séparateur */}
        <span className="border-l border-gray-500 mx-2"></span>

        {/* Vos Vraies Catégories */}
        {categories && categories.map((cat, idx) => (
            <span 
                key={idx} 
                onClick={() => onCategoryClick(cat)}
                className="cursor-pointer hover:border hover:border-white px-1 border border-transparent transition-all"
            >
                {cat}
            </span>
        ))}
      </div>
    </nav>
  );
}