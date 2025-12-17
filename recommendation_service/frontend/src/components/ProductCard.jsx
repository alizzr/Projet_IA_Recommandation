import React from 'react';

export default function ProductCard({ product, onAddToCart, onAddToWishlist, onViewDetails }) {
  // Sécurité : Si l'image est vide, on met une image par défaut
  const imageSrc = product.image || "https://via.placeholder.com/300?text=No+Image";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100 group">
      
      {/* --- ZONE IMAGE (Fixée à une hauteur précise pour l'alignement) --- */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-50 cursor-pointer" onClick={() => onViewDetails && onViewDetails(product)}>
        <img 
          src={imageSrc} 
          alt={product.name} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge Catégorie */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-gray-700">
          {product.category}
        </div>
      </div>

      {/* --- ZONE CONTENU --- */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>
          <h3 
            className="text-lg font-bold text-gray-800 leading-tight cursor-pointer hover:text-blue-600 line-clamp-2"
            onClick={() => onViewDetails && onViewDetails(product)}
          >
            {product.name}
          </h3>
        </div>

        {/* Note / Usage */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">{product.usage}</span>
            {product.rating && <span>⭐ {product.rating}/5</span>}
        </div>

        {/* --- ZONE PRIX & BOUTONS (Collée en bas) --- */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Prix TTC</span>
            <span className="text-xl font-bold text-green-600">{product.price} €</span>
          </div>

          <div className="flex gap-2">
            {/* Bouton Favori */}
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToWishlist && onAddToWishlist(product); }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600 transition-colors"
              title="Ajouter aux favoris"
            >
              ♥
            </button>

            {/* Bouton Ajouter au panier */}
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(product); }}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1 transition-colors shadow-blue-200 hover:shadow-lg"
            >
              <span>+</span>
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}