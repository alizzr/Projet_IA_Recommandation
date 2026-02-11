import React from 'react';

export default function InvoiceModal({ open, onClose, order }) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-[500px] shadow-2xl border-t-4 border-green-500">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">✅ Commande Confirmée !</h2>
          <p className="text-sm text-gray-500">Merci pour votre achat.</p>
        </div>

        <div className="border-b pb-4 mb-4">
          <p><strong>N° Commande :</strong> #{order.id}</p>
          <p><strong>Date :</strong> {order.date}</p>
          <p><strong>Statut :</strong> <span className="text-green-600 font-bold">{order.status}</span></p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-2">📍 Livraison</h3>
          <p>{order.delivery.address}</p>
          <p>{order.delivery.city}</p>
          <p>Tél : {order.delivery.phone}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-2">🛒 Articles</h3>
          <ul className="text-sm">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between py-1 border-b border-dashed">
                <span>{item.name}</span>
                <span>{item.price} €</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center text-xl font-bold mt-6">
          <span>Total à payer :</span>
          <span className="text-green-600">{order.total} €</span>
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Fermer et continuer mes achats
        </button>
      </div>
    </div>
  );
}