import React from "react";

export default function ProductCard({ product, onAddToCart, onAddToWishlist }) {
  // Sécurité prix
  const price = parseFloat(product.price || 0).toFixed(2);
  const [whole, fraction] = price.split('.');

  return (
    <div className="bg-white p-4 flex flex-col justify-between h-full relative group hover:shadow-lg transition-shadow border border-transparent hover:border-gray-200 rounded-sm">
      
      {/* Bouton Cœur (Discret) */}
      <button 
        onClick={() => onAddToWishlist(product)}
        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xl z-10"
        title="Ajouter à la liste d'envies"
      >
        ❤
      </button>

      {/* Image */}
      <div className="h-48 flex items-center justify-center mb-4 cursor-pointer">
        <img 
          src={product.image || "https://via.placeholder.com/300?text=No+Image"} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=Image+Introuvable"; }}
        />
      </div>

      {/* Détails */}
      <div className="space-y-1">
        <h3 className="text-gray-900 font-medium text-sm leading-snug line-clamp-3 hover:text-[#c7511f] cursor-pointer">
          {product.name}
        </h3>
        
        {/* Rating Fictif */}
        <div className="flex items-center gap-1 text-xs">
           <span className="text-[#ffa41c]">★★★★☆</span>
           <span className="text-blue-600 hover:underline cursor-pointer">{Math.floor(Math.random() * 500)}</span>
        </div>

        {/* Prix style Amazon */}
        <div className="flex items-start mt-1">
          <span className="text-xs pt-1">€</span>
          <span className="text-2xl font-bold text-gray-900">{whole}</span>
          <span className="text-xs pt-1">{fraction}</span>
        </div>

        {/* Livraison */}
        <div className="text-xs text-gray-500">
           Livraison <span className="font-bold text-gray-700">GRATUITE</span>
        </div>
      </div>

      {/* Bouton Ajouter (Style Amazon Jaune) */}
      <button 
        onClick={() => onAddToCart(product)}
        className="mt-4 w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] hover:border-[#f2c200] text-gray-900 text-sm py-1.5 rounded-full shadow-sm active:shadow-inner transition-colors"
      >
        Ajouter au panier
      </button>
    </div>
  );
}