import React from "react";

export default function WishlistModal({ open, onClose, wishlist, onRemove, onAddToCart }) {
  if (!open) return null;

  const safeWishlist = wishlist || [];

  return (
    // AJOUT : onClick={onClose} sur le conteneur parent pour fermer en cliquant dehors
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* AJOUT : onClick={(e) => e.stopPropagation()} pour éviter que le clic sur la modale ne la ferme */}
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-fadeIn scale-100"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-t-3xl p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Ma Liste de Souhaits</h3>
                <p className="text-pink-100 text-sm">{safeWishlist.length} article{safeWishlist.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {safeWishlist.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Votre liste est vide</p>
              <button 
                onClick={onClose}
                className="mt-4 text-pink-500 hover:text-pink-600 text-sm font-medium underline"
              >
                Découvrir nos produits
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeWishlist.map((p) => (
                // CORRECTION : Utilisation de p.id comme clé (crucial pour les suppressions)
                <div key={p.id || p._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex gap-4">
                    {/* AJOUT : Placeholder pour l'image du produit */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           📷
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{p.name}</h4>
                          <p className="text-gray-500 text-xs mt-1">{p.brand} • {p.category}</p>
                        </div>
                        <button
                          // CORRECTION : Passage de l'ID au lieu de l'index
                          onClick={() => onRemove(p.id || p._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Retirer de la liste"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-lg font-bold text-gray-900">{p.price} €</span>
                        <button
                          onClick={() => onAddToCart(p)}
                          className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}