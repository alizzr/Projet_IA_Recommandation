import React from 'react';

export default function Navbar({ 
  cartCount, 
  wishlistCount, 
  user, 
  onLogout, 
  onOpenCart, 
  onOpenWishlist, 
  onOpenAuth, 
  onOpenIA,
  onSearch 
}) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => window.location.href='/'}>
          <span className="text-3xl">🛍️</span>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            TechShop
          </span>
        </div>

        {/* BARRE DE RECHERCHE (Filtrage) */}
        <div className="hidden md:flex flex-1 max-w-lg relative">
          <input
            type="text"
            placeholder="Rechercher un produit, une marque..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* ACTIONS DROITE */}
        <div className="flex items-center gap-4">
          
          {/* Bouton IA */}
          <button 
            onClick={onOpenIA}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm hover:shadow-md transition-all"
          >
            <span>✨</span> Assistant IA
          </button>

          {/* Favoris */}
          <button onClick={onOpenWishlist} className="relative p-2 text-gray-500 hover:text-pink-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Panier (C'était manquant) */}
          <button onClick={onOpenCart} className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth */}
          {user ? (
             <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
               <div className="text-right hidden lg:block">
                 <p className="text-xs text-gray-500">Bonjour,</p>
                 <p className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[100px]">{user.email.split('@')[0]}</p>
               </div>
               <button onClick={onLogout} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg" title="Se déconnecter">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
             </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}