import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, onAdd }) {
  if (!products || products.length === 0) {
    return <div className="text-gray-500">Aucun produit trouvé.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(p => <ProductCard key={p.product_id} product={p} onAdd={onAdd} />)}
    </div>
  );
}
