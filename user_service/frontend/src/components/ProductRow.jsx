import React from 'react';

const ProductRow = ({ title, products, onAddToCart }) => {
  // Sécurité : si products n'est pas un tableau, on n'affiche rien
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-yellow-500">
        {title}
      </h2>
      <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id || Math.random()} className="min-w-[220px] bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-3xl">
              {product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : "📦"}
            </div>
            <h3 className="font-bold text-sm text-gray-800 truncate">{product.name}</h3>
            <div className="flex justify-between items-center mt-3">
              <span className="text-blue-600 font-bold">{product.price} €</span>
              <button 
                onClick={() => onAddToCart(product)}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRow;