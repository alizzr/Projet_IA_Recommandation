import React, { useState } from 'react';

export default function CheckoutModal({ open, onClose, onSubmit, total }) {
  const [formData, setFormData] = useState({ address: '', city: '', phone: '' });

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">📦 Livraison & Paiement</h2>
        <p className="mb-4 text-gray-600">Total à payer : <span className="font-bold">{total} €</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">Adresse complète</label>
            <input required type="text" className="w-full border p-2 rounded" 
              placeholder="123 Rue de l'Exemple"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">Ville</label>
            <input required type="text" className="w-full border p-2 rounded" 
              placeholder="Paris"
              value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Téléphone</label>
            <input required type="tel" className="w-full border p-2 rounded" 
              placeholder="06 12 34 56 78"
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="bg-yellow-100 p-3 rounded mb-4 text-sm text-yellow-800">
            ℹ️ Paiement : <strong>Sur place</strong> (Espèces ou Carte) à la livraison.
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-700">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Valider la commande</button>
          </div>
        </form>
      </div>
    </div>
  );
}