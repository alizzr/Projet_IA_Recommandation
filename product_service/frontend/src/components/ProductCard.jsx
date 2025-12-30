import React from "react";

export default function ProductCard({ product, onAddToCart, onAddToWishlist }) {
  // Sécurité prix
  const price = parseFloat(product.price || 0).toFixed(2);
  const [whole, fraction] = price.split('.');

  // --- 1. LOGIQUE IMAGE INTELLIGENTE (Plus d'images aléatoires) ---
  const getImage = (prod) => {
    // Si le produit a déjà une vraie URL d'image, on la garde
    if (prod.image && prod.image.startsWith("http")) return prod.image;

    // Sinon, on met une belle image FIXE selon la catégorie
    const cat = prod.category ? prod.category.toLowerCase() : "tech";
    
    if (cat.includes("laptop") || cat.includes("pc")) {
        return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80";
    }
    if (cat.includes("phone") || cat.includes("smart")) {
        return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80";
    }
    if (cat.includes("gam") || cat.includes("jeu")) {
        return "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80";
    }
    if (cat.includes("audio") || cat.includes("sound")) {
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80";
    }
    // Image par défaut propre (Tablette/Tech)
    return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80";
  };

  // Génération d'un nombre d'avis stable (basé sur l'id et pas random)
  const reviewCount = (product.id || 99) * 3 + 12;

  return (
    <div className="bg-white p-4 flex flex-col justify-between h-full relative group hover:shadow-lg transition-shadow border border-transparent hover:border-gray-200 rounded-sm">
      
      {/* --- 2. BOUTON FAVORIS CORRIGÉ (Bulle blanche visible) --- */}
      <button 
        onClick={(e) => {
            e.stopPropagation(); // Évite de cliquer sur le produit en même temps
            onAddToWishlist(product);
        }}
        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-white transition-all z-10"
        title="Ajouter à la liste d'envies"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Image */}
      <div className="h-48 flex items-center justify-center mb-4 cursor-pointer overflow-hidden">
        <img 
          src={getImage(product)} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Détails */}
      <div className="space-y-1">
        <h3 className="text-gray-900 font-medium text-sm leading-snug line-clamp-3 hover:text-[#c7511f] cursor-pointer">
          {product.name}
        </h3>
        
        {/* Rating Stable */}
        <div className="flex items-center gap-1 text-xs">
           <span className="text-[#ffa41c]">★★★★☆</span>
           <span className="text-blue-600 hover:underline cursor-pointer">{reviewCount}</span>
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