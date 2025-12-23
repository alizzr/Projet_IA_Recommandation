import React from "react";

export default function WishlistModal({ open, onClose, wishlist, onRemove, onAddToCart }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold">Favoris ❤️</h2>
          <button onClick={onClose} className="text-3xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
            {wishlist.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-xl border">
                <img 
                  src={item.image || "https://via.placeholder.com/150"} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg bg-gray-50" 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=X"; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{item.name}</h4>
                  <p className="text-blue-600 font-bold">{item.price} €</p>
                  <button onClick={() => onAddToCart(item)} className="text-xs mt-2 bg-blue-50 text-blue-600 px-2 py-1 rounded">🛒 Ajouter</button>
                </div>
                <button onClick={() => onRemove(item.product_id)} className="p-2 text-gray-300 hover:text-red-500">✕</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}