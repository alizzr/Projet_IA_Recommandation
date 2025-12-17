import React, { useState } from 'react';

export default function ProductCard({ product, onAddToCart, onAddToWishlist, onViewDetails }) {
  // Image par défaut si le lien est cassé
  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
  
  const [imgSrc, setImgSrc] = useState(product.image || PLACEHOLDER_IMG);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group">
      
      {/* IMAGE (Avec gestion d'erreur) */}
      <div 
        className="h-56 p-4 bg-white flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onViewDetails && onViewDetails(product)}
      >
        <img 
          src={imgSrc} 
          alt={product.name} 
          onError={() => setImgSrc(PLACEHOLDER_IMG)} // Si erreur, on met le placeholder
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 bg-gray-100 text-xs font-bold px-2 py-1 rounded text-gray-600">
          {product.category}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 border-t border-gray-50">
        <div className="mb-2">
          <p className="text-xs text-blue-600 font-bold uppercase mb-1">{product.brand}</p>
          <h3 
            className="font-bold text-gray-800 text-base leading-tight line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => onViewDetails && onViewDetails(product)}
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
           <span className="bg-gray-100 px-2 py-1 rounded">{product.usage}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-gray-900">{product.price} €</span>

          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToWishlist && onAddToWishlist(product); }}
              className="w-9 h-9 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100"
            >
              ♥
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(product); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md transition flex items-center gap-1"
            >
              <span>+</span> Panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}