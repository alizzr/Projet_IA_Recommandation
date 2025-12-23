import React from "react";
import ProductCard from "./ProductCard";

export default function ProductRow({ title, products, onAddToCart, onAddToWishlist }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white p-6 mb-6 shadow-sm mx-4 md:mx-0">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      {/* Grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard 
            key={product.id || product.product_id} 
            product={product} 
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist} 
          />
        ))}
      </div>
    </div>
  );
}