import React from "react";

export default function ProductCard({ product, onAddToCart, onAddToWishlist, onOpenDetails }) {
  const price = parseFloat(product.price || 0).toFixed(2);
  const [whole, fraction] = price.split('.');

  // Image: utilise image_url du produit ou fallback par catégorie
  const getImage = (prod) => {
    if (prod.image_url && prod.image_url.startsWith("http")) return prod.image_url;
    if (prod.image && prod.image.startsWith("http")) return prod.image;

    const cat = (prod.category || "").toLowerCase();
    const fallbacks = {
      "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80",
      "clothing": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
      "books": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
      "toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=400&q=80",
      "home": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80",
      "furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    };
    return fallbacks[cat] || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80";
  };

  // Étoiles dynamiques
  const rating = parseFloat(product.rating || product.design_rating || 4.0);
  const fullStars = Math.floor(Math.min(rating, 5));
  const hasHalf = (rating - fullStars) >= 0.25;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const reviewCount = ((product.id || 99) * 7 + 42) % 500 + 10;

  // Couleur de la catégorie
  const catColors = {
    "Electronics": "bg-blue-50 text-blue-700",
    "Clothing": "bg-pink-50 text-pink-700",
    "Books": "bg-amber-50 text-amber-700",
    "Toys": "bg-green-50 text-green-700",
    "Home": "bg-purple-50 text-purple-700",
    "Furniture": "bg-orange-50 text-orange-700",
  };
  const catClass = catColors[product.category] || "bg-gray-50 text-gray-700";

  return (
    <div
      className="bg-white rounded-xl flex flex-col justify-between h-full relative group hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden cursor-pointer"
      onClick={() => onOpenDetails && onOpenDetails(product)}
    >

      {/* Favoris */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToWishlist(product);
        }}
        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg text-gray-300 hover:text-red-500 hover:scale-110 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
        title="Ajouter aux favoris"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Image container */}
      <div className="relative h-52 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 overflow-hidden">
        <img
          src={getImage(product)}
          alt={product.name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"; }}
        />

        {/* Badge catégorie */}
        {product.category && (
          <span className={`absolute top-3 left-3 ${catClass} text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm`}>
            {product.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 space-y-1.5">
          <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#c7511f] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-sm">
              {[...Array(fullStars)].map((_, i) => <span key={`f${i}`} className="text-[#ffa41c]">★</span>)}
              {hasHalf && <span className="text-[#ffa41c]">★</span>}
              {[...Array(Math.max(0, emptyStars))].map((_, i) => <span key={`e${i}`} className="text-gray-300">★</span>)}
            </div>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>

          {/* Prix */}
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-xs text-gray-500 font-medium">€</span>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">{whole}</span>
            <span className="text-xs text-gray-500 font-medium">{fraction}</span>
          </div>

          <p className="text-[11px] text-green-600 font-medium">
            ✓ Livraison GRATUITE
          </p>
        </div>

        {/* Bouton */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="mt-3 w-full bg-gradient-to-b from-[#ffd814] to-[#f7ca00] hover:from-[#f7ca00] hover:to-[#e8b900] text-gray-900 text-sm py-2.5 rounded-full font-bold shadow-sm active:shadow-inner transition-all duration-200 hover:shadow-md"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}