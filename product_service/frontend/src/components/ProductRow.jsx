import React from "react";
import ProductCard from "./ProductCard";

const blockIcons = {
  "🎯": "bg-gradient-to-r from-violet-500 to-purple-600",
  "👀": "bg-gradient-to-r from-pink-500 to-rose-600",
  "⭐": "bg-gradient-to-r from-amber-400 to-yellow-500",
  "💡": "bg-gradient-to-r from-cyan-500 to-blue-600",
  "💸": "bg-gradient-to-r from-green-500 to-emerald-600",
  "🔥": "bg-gradient-to-r from-orange-500 to-red-600",
};

export default function ProductRow({ title, products, onAddToCart, onAddToWishlist, onOpenDetails }) {
  if (!products || products.length === 0) return null;

  // Extraire l'emoji du titre pour le style
  const emoji = title ? title.match(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u)?.[0] : null;
  const gradientClass = (emoji && blockIcons[emoji]) || "bg-gradient-to-r from-gray-600 to-gray-700";

  return (
    <div className="mb-6 mx-4 md:mx-0">
      {/* Header du bloc */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${gradientClass} w-1.5 h-8 rounded-full`}></div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-gray-200 to-transparent ml-2"></div>
      </div>

      {/* Grille responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id || product.product_id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </div>
  );
}