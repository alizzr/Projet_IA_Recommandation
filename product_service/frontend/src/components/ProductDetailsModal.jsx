import React, { useState } from "react";

export default function ProductDetailsModal({ product, open, onClose, onAddToCart, onBuyNow }) {
  const [quantity, setQuantity] = useState(1);

  if (!open || !product) return null;

  // Image intelligente
  const getImage = (prod) => {
    if (prod.image_url && prod.image_url.startsWith("http")) return prod.image_url;
    if (prod.image && prod.image.startsWith("http")) return prod.image;
    const cat = (prod.category || "").toLowerCase();
    const fallbacks = {
      "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
      "clothing": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      "books": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      "toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=600&q=80",
      "home": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
      "furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    };
    return fallbacks[cat] || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";
  };

  const imgSrc = getImage(product);
  const price = parseFloat(product.price || 0);
  const totalPrice = (price * quantity).toFixed(2);

  // Rating étoiles
  const rating = parseFloat(product.rating || product.design_rating || 4.0);
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars = "★".repeat(fullStars) + (hasHalf ? "★" : "") + "☆".repeat(5 - fullStars - (hasHalf ? 1 : 0));
  const reviewCount = (product.id || 99) * 3 + 12;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
    if (onBuyNow) onBuyNow();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">

          {/* Image */}
          <div className="lg:w-1/2 p-6 bg-gray-50">
            <div className="relative h-full min-h-[300px] flex items-center justify-center">
              <img
                src={imgSrc}
                alt={product.name}
                className="max-w-full max-h-[400px] object-contain rounded-xl"
              />
              <button
                onClick={onClose}
                className="absolute top-2 right-2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Badge catégorie */}
              {product.category && (
                <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </span>
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="lg:w-1/2 p-6 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>

              {product.brand && (
                <p className="text-gray-500 mb-3">par <span className="text-blue-600 hover:underline cursor-pointer">{product.brand}</span></p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#ffa41c] text-lg tracking-tight">{stars}</span>
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">{reviewCount} évaluations</span>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-4">
                {/* Prix */}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500">Prix :</span>
                  <span className="text-3xl font-bold text-[#B12704]">{price.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tous les prix incluent la TVA.</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-green-600 font-bold text-sm">✓ En stock</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Livraison <span className="font-bold text-gray-700">GRATUITE</span> dès 25€
                </p>
              </div>

              {/* Spécifications */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Caractéristiques</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  {product.brand && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Marque</span>
                      <span className="font-medium text-gray-800">{product.brand}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Catégorie</span>
                    <span className="font-medium text-gray-800">{product.category}</span>
                  </div>
                  {product.usage && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Usage</span>
                      <span className="font-medium text-gray-800">{product.usage}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Note</span>
                    <span className="font-medium text-gray-800">{rating.toFixed(1)} / 5</span>
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Zone d'achat */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {/* Quantité */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium">Qté :</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                  >−</button>
                  <span className="px-4 py-2 text-center min-w-[3rem] border-x border-gray-300 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                  >+</button>
                </div>
                <span className="text-sm text-gray-500 ml-auto font-medium">{totalPrice} €</span>
              </div>

              {/* Bouton Ajouter au panier */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] text-gray-900 py-3 rounded-full font-bold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Ajouter au panier
              </button>

              {/* Bouton Acheter maintenant */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#fa8900] hover:bg-[#e47b00] border border-[#e47b00] text-white py-3 rounded-full font-bold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acheter maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
