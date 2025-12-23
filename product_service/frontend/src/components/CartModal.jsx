import React, { useState } from "react";

export default function CartModal({ open, onClose, cart, onCheckout, onRemove }) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePayment = async () => {
    setLoading(true);
    await onCheckout();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Mon Panier ({cart.length})</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 items-center bg-white p-3 rounded-lg border shadow-sm">
                <img 
                  src={item.image || "https://via.placeholder.com/150"} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-md bg-gray-100" 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=X"; }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-blue-600 font-bold">{item.price} €</p>
                </div>
                <button onClick={() => onRemove(item.product_id)} className="text-gray-300 hover:text-red-500 p-2">🗑️</button>
              </div>
            ))}
        </div>
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4 text-lg font-bold"><span>Total</span><span>{total.toFixed(2)} €</span></div>
          <button disabled={cart.length === 0 || loading} onClick={handlePayment} className="w-full py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700">
            {loading ? "Paiement..." : "Payer"}
          </button>
        </div>
      </div>
    </div>
  );
}